const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // 🔁 fixed key
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCLoudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder: 'pre_recordings'
  });

  return {
    url: result.secure_url,
    id: result.public_id
  };
};


const destryFromCloudinary = async (public_id) => {
    const result = await cloudinary.uploader.destroy(public_id);
    return true;
};

module.exports = {
  uploadToCLoudinary,
  destryFromCloudinary
};
