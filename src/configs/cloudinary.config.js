import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Rasmni Cloudinary ga yuklash
 * @param {string} filePath - local fayl yo'li
 * @param {string} folder - cloudinary papkasi
 * @returns {Promise<string>} - secure_url
 */
export const uploadToCloudinary = async (filePath, folder = "blog") => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "auto",
  });
  return result.secure_url;
};

/**
 * Cloudinary dan rasmni o'chirish
 * @param {string} imageUrl - cloudinary URL
 */
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) return;
  try {
    // URL dan public_id ajratish
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    const public_id = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

export default cloudinary;
