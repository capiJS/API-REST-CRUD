import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "./config.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(filePath) {
  return await cloudinary.uploader.upload(filePath, { folder: "uploads" });
}

export async function deleteImage(publicId) {
  return await cloudinary.uploader.destroy(publicId);
}

export function extractPublicIdFromUrl(cloudinaryUrl) {
  if (cloudinaryUrl) {
    const startIndex = cloudinaryUrl.indexOf("uploads/");
    const endIndex = cloudinaryUrl.lastIndexOf(".");

    if (startIndex >= 0 && endIndex >= 0 && startIndex < endIndex) {
      return cloudinaryUrl.slice(startIndex, endIndex);
    }
  }

  return null; // Si no se pudo extraer el public_id o la URL era null, retornamos null
}
