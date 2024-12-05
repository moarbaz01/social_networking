const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
      folder: "social-networking",
    });
    fs.unlinkSync(file.tempFilePath);
    return { url: result.secure_url };
  } catch (error) {
    console.log("cloudinary error : ", error);
    return { error: error.message };
  }
}

module.exports = uploadImage;
