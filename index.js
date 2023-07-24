import { DB_HOST, DB_NAME, DB_PASSW0RD, DB_PORT, DB_USER } from "./config.js";
import express from "express";
import bodyParser from "body-parser";
import mysql2 from "mysql2";
import cors from "cors";
import multer from "multer";
import { PORT } from "./config.js";

const app = express();

app.use("/uploads", express.static("uploads"));

// Create connection to MySQL database

const db = mysql2.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSW0RD,
  database: DB_NAME,
  port: DB_PORT,
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database with ID " + db.threadId);
});

// Set up multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create multer instance with the storage configuration
const upload = multer({ storage });

app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  cors({
    "Access-Control-Allow-Origin": `http://${DB_HOST}:${PORT}/`,
  })
);

// Define a route for getting all clients
// ORDER by cl_id desc - this could be place after clientes

//GET CLIENTES---------------------------------------------------------------------
app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM clientes ", (err, results) => {
    if (err) {
      console.error("Error getting clientes from MySQL database: " + err.stack);
      return res.status(500).send("Error getting clientes from database");
    }
    return res.json(results);
  });
});

//GET EMPLEADOS--------------------------------------------------------------------
app.get("/empleados", (req, res) => {
  db.query("SELECT * FROM empleados ", (err, results) => {
    if (err) {
      console.error(
        "Error getting empleados from MySQL database: " + err.stack
      );
      return res.status(500).send("Error getting empleados from database");
    }
    return res.json(results);
  });
});

//GET PAGOS--------------------------------------------------------------------
app.get("/pagos", (req, res) => {
  db.query("SELECT * FROM pagos ", (err, results) => {
    if (err) {
      console.error("Error getting pagos from MySQL database: " + err.stack);
      return res.status(500).send("Error getting pagos from database");
    }
    return res.json(results);
  });
});

//---------------------------------------------------------------------------------

// app.get("/traerproductos", (request, response) => {
//   // Podemos acceder a la petición HTTP
//   const params = request.query;
//   const respuesta = {
//     productos: [
//       {
//         id: 1,
//         camiseta: "blanca",
//       },
//       { id: 2, camiseta: "negra" },
//     ],
//   };
//   console.log("imprimiendo params", params);
//   response.status(200).send({ message: "GET OK", data: respuesta, params });
// });

//POST CLIENTES----------------------------------------------------------------
// Define a route for adding a new client
app.post("/clientes", upload.single("cl_photo"), (req, res) => {
  const { cl_nombre, cl_cedula, cl_celular } = req.body;

  let cl_photo;
  if (req.file) {
    cl_photo =
      "https://api-rest-crud-production.up.railway.app" +
      // "/uploads" +
      req.file.filename; // Get the filename of the newCliente photo
  }

  const newcliente = { cl_nombre, cl_cedula, cl_celular };

  if (cl_photo) {
    newcliente.cl_photo = cl_photo;
  }

  db.query("INSERT INTO clientes SET ?", newcliente, (err, result) => {
    if (err) {
      console.error("Error adding cliente to MySQL database: " + err.stack);
      return res.status(500).send("Error adding cliente to database");
    }
    return res.send("cliente added to database with ID " + result.insertId);
  });
});

//POST EMPLEADOS----------------------------------------------------------------
app.post("/empleados", upload.single("em_photo"), (req, res) => {
  const { em_nombre, em_cedula, em_celular } = req.body;

  let em_photo;
  if (req.file) {
    em_photo = `http://${DB_HOST}:${PORT}/uploads/` + req.file.filename; // Get the filename of the newCliente photo
  }

  const newempleado = { em_nombre, em_cedula, em_celular };

  if (em_photo) {
    newempleado.em_photo = em_photo;
  }

  db.query("INSERT INTO empleados SET ?", newempleado, (err, result) => {
    if (err) {
      console.error("Error adding cliente to MySQL database: " + err.stack);
      return res.status(500).send("Error adding cliente to database");
    }
    return res.send("cliente added to database with ID " + result.insertId);
  });
});

//------------------------------------------------------------------------------

// app.post("/crearproducto", (request, reponse) => {
//   const payload = request.body;

//   console.log("payload", payload);
//   reponse.status(200).send({ message: "*---holaa", data: payload });
// });

// Define a route for getting a client by their ID
app.get("/clientes/:cl_id", (req, res) => {
  const id = req.params.cl_id;
  db.query("SELECT * FROM clientes WHERE cl_id = ?", id, (err, results) => {
    if (err) {
      console.error("Error getting user from MySQL database: " + err.stack);
      return res.status(500).send("Error getting cliente from database");
    }
    if (results.length === 0) {
      return res.status(404).send("cliente not found");
    }
    return res.json(results);
  });
});

// app.get("/traerproductosporid/:id", (request, reponse) => {
//   const id = request.params.id;
//   console.log("id", id);
//   reponse.status(200).send(`GET ID OK #${id}`);
// });

//Define a route for updating a user by their ID

app.put("/clientes/:cl_id", upload.single("cl_photo"), (req, res) => {
  const id = req.params.cl_id;
  const { cl_nombre, cl_cedula, cl_celular } = req.body;

  let cl_photo;
  if (req.file) {
    cl_photo = "http://localhost:4000/uploads/" + req.file.filename;
  }

  const updatedCliente = { cl_nombre, cl_cedula, cl_celular };

  if (cl_photo) {
    updatedCliente.cl_photo = cl_photo;
  }

  db.query(
    "UPDATE clientes SET ? WHERE cl_id = ?",
    [updatedCliente, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user in MySQL database: " + err.stack);
        return res.status(500).send("Error updating user in database");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("User not found");
      }
      return res.send("cliente updated in clientes");
    }
  );
});

//PUT EMPLEADOS --------------------------------------------------------------

app.put("/empleados/:em_id", upload.single("em_photo"), (req, res) => {
  const id = req.params.em_id;
  const { em_nombre, em_cedula, em_celular } = req.body;

  let em_photo;
  if (req.file) {
    em_photo = `http://${DB_HOST}:${PORT}/uploads/` + req.file.filename;
  }

  const updatedEmpleado = { em_nombre, em_cedula, em_celular };

  if (em_photo) {
    updatedEmpleado.em_photo = em_photo;
  }

  db.query(
    "UPDATE empleados SET ? WHERE em_id = ?",
    [updatedEmpleado, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user in MySQL database: " + err.stack);
        return res.status(500).send("Error updating user in database");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("User not found");
      }
      return res.send("empleado updated in clientes");
    }
  );
});

//----------------------------------------------------------------------------

// app.put("/actualizarporid/:id", (request, reponse) => {
//   const id = request.params.id;
//   const payload = request.body;
//   console.log("id", id);
//   console.log("payload", payload);
//   reponse.status(200).send("PUT ID OK");
// });

// Define a route for deleting a cliente by their ID
app.delete("/clientes/:cl_id", (req, res) => {
  const id = req.params.cl_id;
  db.query("DELETE FROM clientes WHERE cl_id = ?", id, (err, result) => {
    if (err) {
      console.error("Error deleting cliente from MySQL database: " + err.stack);
      return res.status(500).send("Error deleting cliente from database");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("cliente not found");
    }
    return res.send("cliente deleted from database");
  });
});

//DELETE EMPLEADOS---------------------------------------------------------------
app.delete("/empleados/:em_id", (req, res) => {
  const id = req.params.em_id;
  db.query("DELETE FROM empleados WHERE em_id = ?", id, (err, result) => {
    if (err) {
      console.error("Error deleting cliente from MySQL database: " + err.stack);
      return res.status(500).send("Error deleting cliente from database");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("cliente not found");
    }
    return res.send("empleado deleted from database");
  });
});
//-------------------------------------------------------------------------------

// app.delete("/eliminarproductoporid/:id", (request, reponse) => {
//   const id = request.params.id;
//   console.log("id", id);
//   reponse.status(200).send("DELETE  OK");
// });

// prueba puerto run
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error escuchando: ", err);
    return;
  }

  console.log(`Escuchando en el puerto :${PORT}`);
});
