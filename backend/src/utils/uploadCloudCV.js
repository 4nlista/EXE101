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
    folder: 'universe_cvs', // Tên thư mục trên Cloudinary cho CV
    allowed_formats: ['pdf'], // Chỉ cho phép file PDF
    // Không dùng transformation vì CV là raw file (tài liệu), không phải ảnh
    format: 'pdf', // Explicitly specify format for PDF
  }
});

// Khởi tạo middleware multer cho CV
const uploadCloudCV = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn file 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ file PDF.'));
    }
  }
});

module.exports = uploadCloudCV;
