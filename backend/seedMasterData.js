const mongoose = require('mongoose');
require('dotenv').config();
const Major = require('./src/models/Major');
const Specialization = require('./src/models/Specialization');

const seedMasterData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/EXE101');
    console.log('MongoDB connected for seeding master data...');

    // Xóa data cũ
    await Major.deleteMany({});
    await Specialization.deleteMany({});
    console.log('Xóa dữ liệu cũ thành công.');

    // 1. Tạo Majors
    const itMajor = await Major.create({ code: 'IT', name: 'Công nghệ thông tin', description: 'Ngành Công nghệ thông tin' });
    const bizMajor = await Major.create({ code: 'BIZ', name: 'Quản trị kinh doanh', description: 'Ngành Kinh tế' });
    const designMajor = await Major.create({ code: 'DES', name: 'Thiết kế đồ họa', description: 'Ngành Thiết kế' });

    // 2. Tạo Specializations
    await Specialization.insertMany([
      // IT
      { majorId: itMajor._id, code: 'SE', name: 'Kỹ thuật phần mềm' },
      { majorId: itMajor._id, code: 'IA', name: 'An toàn thông tin' },
      { majorId: itMajor._id, code: 'AI', name: 'Trí tuệ nhân tạo' },
      { majorId: itMajor._id, code: 'IS', name: 'Hệ thống thông tin' },
      // Biz
      { majorId: bizMajor._id, code: 'DM', name: 'Digital Marketing' },
      { majorId: bizMajor._id, code: 'FIN', name: 'Tài chính doanh nghiệp' },
      // Design
      { majorId: designMajor._id, code: 'UIUX', name: 'UI/UX Design' },
      { majorId: designMajor._id, code: '3D', name: 'Thiết kế 3D' }
    ]);

    console.log('Seed master data thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi seed data:', err);
    process.exit(1);
  }
};

seedMasterData();
