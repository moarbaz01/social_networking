const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });
    return { url: result.secure_url };
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = uploadImage;
