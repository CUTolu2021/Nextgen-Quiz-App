const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { uploadToCloudinary };