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
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary: " + error.message);
    throw error;
  }
}

export function extractPublicIdFromUrl(cloudinaryUrl) {
  const startIndex = cloudinaryUrl.indexOf("uploads/");
  const endIndex = cloudinaryUrl.lastIndexOf(".");

  if (startIndex >= 0 && endIndex >= 0 && startIndex < endIndex) {
    return cloudinaryUrl.slice(startIndex, endIndex);
  }

  return null; // Si no se pudo extraer el public_id, retornamos null
}
