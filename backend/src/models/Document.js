const mongoose = require('mongoose');

// Schema tài liệu học tập (upload bởi User VIP/Premium)
const documentSchema = new mongoose.Schema(
  {
    // Thuộc môn học nào
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    // Người upload tài liệu (VIP/Premium)
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Tiêu đề tài liệu
    title: {
      type: String,
      required: true
    },
    // Mô tả nội dung tài liệu
    description: {
      type: String
    },
    // Đường link file tài liệu (lưu trên cloud storage)
    fileUrl: {
      type: String,
      required: true
    },
    // Tên file gốc
    fileName: {
      type: String
    },
    // Dung lượng file (bytes)
    fileSize: {
      type: Number
    }
  },
  { timestamps: true }
);

// Index: tìm tài liệu theo môn học
documentSchema.index({ subjectId: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
