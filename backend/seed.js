require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedDB = async () => {
  try {
    // 1. Kết nối Mongo
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/universe_ai';
    await mongoose.connect(uri);
    console.log('MongoDB Connected cho Seed DB.');

    // 2. Xóa dữ liệu cũ (tùy chọn - cẩn thận nếu DB đã có data quan trọng)
    await User.deleteMany({ email: 'test@universe.com' });
    console.log('Xóa tài khoản test cũ thành công.');

    // 3. Tạo Mật khẩu mã hóa
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 4. Tạo User mới
    const testUser = new User({
      email: 'test@universe.com',
      password: hashedPassword,
      name: 'Nguyễn Sinh Viên',
      roleCode: 1, // 1 = User/Student
      isActive: 1, // 1 = ONLINE
      onboardingCompleted: false // Chưa thiết lập hồ sơ
    });

    await testUser.save();
    console.log('✅ Tạo tài khoản Test thành công:');
    console.log('- Email:', 'test@universe.com');
    console.log('- Mật khẩu:', '123456');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi seed DB:', error);
    process.exit(1);
  }
};

seedDB();
