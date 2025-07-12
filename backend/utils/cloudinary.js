const cloudinary = require("cloudinary").v2;
const {config} = require("dotenv");

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (base64String) => {
  const result = await cloudinary.uploader.upload(base64String, {
    resource_type: "image",
  });
  return result.secure_url;
};

module.exports = {
  uploadToCloudinary,
};
