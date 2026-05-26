require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ================= STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "WanderLust_DEV",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp"
    ],

    transformation: [
      {
        width: 1200,
        crop: "limit",
        quality: "auto"
      }
    ]
  }
});

// ================= EXPORT =================
module.exports = {
  cloudinary,
  storage
};