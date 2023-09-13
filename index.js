import {
  DB_HOST,
  DB_NAME,
  DB_PASSW0RD,
  DB_PORT,
  DB_USER,
  URL_API,
} from "./config.js";
import express from "express";
import bodyParser from "body-parser";
import mysql2 from "mysql2";
import cors from "cors";
import multer from "multer";
import { PORT } from "./config.js";
import fileUpload from "express-fileupload";
import {
  uploadImage,
  deleteImage,
  extractPublicIdFromUrl,
} from "./cloudinary.js";

const app = express();

// app.use("/uploads", express.static("uploads"));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  })
);

// Create connection to MySQL database

const db = mysql2.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSW0RD,
  database: DB_NAME,
  port: DB_PORT,
});

// Connect to MySQL database
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database with ID " + connection.threadId);
  connection.release(); // Release the connection back to the pool after connecting
});

// Set up multer storage configuration for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // Create multer instance with the storage configuration
// const upload = multer({ storage });

app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  cors({
    origin: [URL_API],
  })
);

// Define a route for getting all clients
// ORDER by cl_id desc - this could be place after clientes

//GET CLIENTES---------------------------------------------------------------------
app.get("/clientes", async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM clientes", (err, results) => {
        if (err) {
          console.error(
            "Error getting clientes from MySQL database: " + err.stack
          );
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    return res.json(results);
  } catch (error) {
    return res.status(500).send("Error getting clientes from database");
  }
});

//GET EMPLEADOS--------------------------------------------------------------------
app.get("/empleados", async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM empleados", (err, results) => {
        if (err) {
          console.error(
            "Error getting empleados from MySQL database: " + err.stack
          );
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    return res.json(results);
  } catch (error) {
    return res.status(500).send("Error getting empleados from database");
  }
});

//GET PAGOS--------------------------------------------------------------------

app.get("/pagos", async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM pagos", (err, results) => {
        if (err) {
          console.error(
            "Error getting pagos from MySQL database: " + err.stack
          );
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    return res.json(results);
  } catch (error) {
    return res.status(500).send("Error getting pagos from database");
  }
});

//POST CLIENTES----------------------------------------------------------------
// Define a route for adding a new client

app.post("/clientes", async (req, res) => {
  const { cl_nombre, cl_cedula, cl_celular } = req.body;

  let cl_photo;
  if (req.files && req.files.cl_photo) {
    try {
      const imageInfo = await uploadImage(req.files.cl_photo.tempFilePath);
      cl_photo = imageInfo.secure_url;
      console.log("Cloudinary Image Info:", imageInfo);
    } catch (error) {
      console.error("Error uploading image to Cloudinary: " + error);
      return res.status(500).send("Error uploading image to Cloudinary");
    }
  }

  const newcliente = { cl_nombre, cl_cedula, cl_celular, cl_photo };

  db.query("INSERT INTO clientes SET ?", newcliente, (err, result) => {
    if (err) {
      console.error("Error adding cliente to MySQL database: " + err.stack);
      return res.status(500).send("Error adding cliente to database");
    }
    return res.send("cliente added to database with ID " + result.insertId);
  });
});

//POST EMPLEADOS----------------------------------------------------------------

app.post("/empleados", async (req, res) => {
  const { em_nombre, em_cedula, em_celular } = req.body;

  let em_photo;
  if (req.files && req.files.em_photo) {
    try {
      const imageInfo = await uploadImage(req.files.em_photo.tempFilePath);
      em_photo = imageInfo.secure_url;
      console.log("Cloudinary Image Info:", imageInfo);
    } catch (error) {
      console.error("Error uploading image to Cloudinary: " + error);
      return res.status(500).send("Error uploading image to Cloudinary");
    }
  }

  const newempleado = { em_nombre, em_cedula, em_celular, em_photo };

  db.query("INSERT INTO empleados SET ?", newempleado, (err, result) => {
    if (err) {
      console.error("Error adding empleado to MySQL database: " + err.stack);
      return res.status(500).send("Error adding empleado to database");
    }
    return res.send("empleado added to database with ID " + result.insertId);
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

app.put("/clientes/:cl_id", async (req, res) => {
  const id = req.params.cl_id;
  const { cl_nombre, cl_cedula, cl_celular } = req.body;

  let cl_photo;
  if (req.files && req.files.cl_photo) {
    try {
      const imageInfo = await uploadImage(req.files.cl_photo.tempFilePath);
      cl_photo = imageInfo.secure_url;
      console.log("Cloudinary Image Info:", imageInfo);
    } catch (error) {
      console.error("Error uploading image to Cloudinary: " + error);
      return res.status(500).send("Error uploading image to Cloudinary");
    }
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

app.put("/empleados/:em_id", async (req, res) => {
  const id = req.params.em_id;
  const { em_nombre, em_cedula, em_celular } = req.body;

  let em_photo;
  if (req.files && req.files.em_photo) {
    try {
      const imageInfo = await uploadImage(req.files.em_photo.tempFilePath);
      em_photo = imageInfo.secure_url;
      console.log("Cloudinary Image Info:", imageInfo);
    } catch (error) {
      console.error("Error uploading image to Cloudinary: " + error);
      return res.status(500).send("Error uploading image to Cloudinary");
    }
  }

  const updatedempleado = { em_nombre, em_cedula, em_celular };

  if (em_photo) {
    updatedempleado.em_photo = em_photo;
  }

  db.query(
    "UPDATE empleados SET ? WHERE em_id = ?",
    [updatedempleado, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user in MySQL database: " + err.stack);
        return res.status(500).send("Error updating user in database");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("User not found");
      }
      return res.send("empleado updated in empleados");
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

//DELETE CLIENTES--------------------------------------------------------------
// Define a route for deleting a cliente by their ID
app.delete("/clientes/:cl_id", async (req, res) => {
  const id = req.params.cl_id;

  // Obtener el cliente por su ID
  db.query(
    "SELECT * FROM clientes WHERE cl_id = ?",
    id,
    async (err, results) => {
      if (err) {
        console.error(
          "Error getting cliente from MySQL database: " + err.stack
        );
        return res.status(500).send("Error getting cliente from database");
      }
      if (results.length === 0) {
        return res.status(404).send("cliente not found");
      }

      const cliente = results[0];
      const cloudinaryUrl = cliente.cl_photo;

      const publicId = extractPublicIdFromUrl(cloudinaryUrl);

      console.log("Public ID:", publicId);

      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary: " + error);
          return res.status(500).send("Error deleting image from Cloudinary");
        }
      }

      // Eliminar el cliente de la base de datos
      db.query("DELETE FROM clientes WHERE cl_id = ?", id, (err, result) => {
        if (err) {
          console.error(
            "Error deleting cliente from MySQL database: " + err.stack
          );
          return res.status(500).send("Error deleting cliente from database");
        }
        if (result.affectedRows === 0) {
          return res.status(404).send("cliente not found");
        }
        return res.send(
          "cliente and associated image deleted from database and Cloudinary"
        );
      });
    }
  );
});

//DELETE EMPLEADOS---------------------------------------------------------------
app.delete("/empleados/:em_id", async (req, res) => {
  const id = req.params.em_id;

  // Obtener el empleado por su ID
  db.query(
    "SELECT * FROM empleados WHERE em_id = ?",
    id,
    async (err, results) => {
      if (err) {
        console.error(
          "Error getting empleado from MySQL database: " + err.stack
        );
        return res.status(500).send("Error getting empleado from database");
      }
      if (results.length === 0) {
        return res.status(404).send("empleado not found");
      }

      const empleado = results[0];
      const cloudinaryUrl = empleado.em_photo;

      const publicId = extractPublicIdFromUrl(cloudinaryUrl);

      console.log("Public ID:", publicId);

      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary: " + error);
          return res.status(500).send("Error deleting image from Cloudinary");
        }
      }

      // Eliminar el empleado de la base de datos
      db.query("DELETE FROM empleados WHERE em_id = ?", id, (err, result) => {
        if (err) {
          console.error(
            "Error deleting empleado from MySQL database: " + err.stack
          );
          return res.status(500).send("Error deleting empleado from database");
        }
        if (result.affectedRows === 0) {
          return res.status(404).send("empleado not found");
        }
        return res.send(
          "empleado and associated image deleted from database and Cloudinary"
        );
      });
    }
  );
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
