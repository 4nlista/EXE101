const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'universe_avatars', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Tự động resize ảnh cho nhẹ
  }
});

// Khởi tạo middleware multer
const uploadCloud = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file 5MB
});

module.exports = uploadCloud;
