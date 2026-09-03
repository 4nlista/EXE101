const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/emailSender');

/**
 * Tạo mã OTP ngẫu nhiên 6 số
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Dịch vụ xử lý đăng nhập
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { token, user }
 */
const loginUser = async (email, password) => {
  // 1. Tìm user theo email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Tài khoản không tồn tại.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Kiểm tra tài khoản có bị khóa không
  if (user.isActive === 2) { // 2 = LOCKED
    const error = new Error('Tài khoản của bạn đã bị khóa.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Kiểm tra mật khẩu (nếu user đăng nhập bằng Google thì ko có pass)
  if (!user.password) {
    const error = new Error('Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Sai mật khẩu. Vui lòng thử lại.');
    error.statusCode = 401;
    throw error;
  }

  // Cập nhật trạng thái thành ONLINE
  user.isActive = 1;
  await user.save();

  // 4. Tạo JWT Token
  const payload = {
    id: user._id,
    roleCode: user.roleCode
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'universe-secret-key', {
    expiresIn: '7d' // Token sống 7 ngày
  });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roleCode: user.roleCode,
      onboardingCompleted: user.onboardingCompleted,
      currentPackage: user.currentPackage
    }
  };
};

/**
 * Đăng ký - Tạo và gửi OTP
 */
const registerUser = async (email, password) => {
  // 1. Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email này đã được sử dụng.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Tạo mã OTP
  const otpCode = generateOTP();

  // 3. Xóa các OTP cũ của email này chưa được sử dụng
  await Otp.deleteMany({ email });

  // 4. Lưu OTP vào DB (hết hạn sau 5 phút)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  
  await Otp.create({
    email,
    code: otpCode,
    expiresAt
  });

  // 5. Gửi email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #6366f1; text-align: center;">UniVerse AI</h2>
      <p>Xin chào,</p>
      <p>Bạn đang thực hiện đăng ký tài khoản tại UniVerse AI. Đây là mã xác thực (OTP) của bạn:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; padding: 10px 20px; font-size: 24px; font-weight: bold; background-color: #f3f4f6; color: #111827; letter-spacing: 5px; border-radius: 4px;">${otpCode}</span>
      </div>
      <p style="color: #ef4444; font-size: 14px;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
    </div>
  `;
  await sendEmail(email, 'Mã xác thực đăng ký tài khoản UniVerse AI', htmlContent);

  // 6. Lưu mật khẩu tạm thời vào đâu? 
  // Vì OTP gửi đi, ta ko thể tạo User ngay. Khi verify OTP thành công ta mới tạo.
  // Ta có thể cache password trong DB (ví dụ bảng Otp có thêm tempPassword) hoặc yêu cầu client gửi lại password lúc verify.
  // Thông thường: verify xong trả về 1 tempToken, sau đó client gọi API tạo user kèm thông tin. Hoặc gửi lại pass lúc verify.
  // Ta sẽ chọn cách: Client gửi email, otp, password lúc gọi verifyOtp.
  
  return { message: 'Mã xác thực đã được gửi tới email của bạn.' };
};

/**
 * Xác thực OTP và Tạo User
 */
const verifyOtp = async (name, email, otp, password) => {
  // 1. Kiểm tra OTP hợp lệ
  const otpRecord = await Otp.findOne({ email, isUsed: false }).sort({ createdAt: -1 });
  if (!otpRecord) {
    const error = new Error('Không tìm thấy mã OTP hoặc mã đã hết hạn.');
    error.statusCode = 400;
    throw error;
  }

  // Check hết hạn
  if (otpRecord.expiresAt < new Date()) {
    const error = new Error('Mã OTP đã hết hạn.');
    error.statusCode = 400;
    throw error;
  }

  if (otpRecord.code !== otp) {
    const error = new Error('Mã OTP không chính xác.');
    error.statusCode = 400;
    throw error;
  }

  // Đánh dấu OTP đã dùng
  otpRecord.isUsed = true;
  await otpRecord.save();

  // 2. Tạo User mới
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name || 'Người dùng mới',
    email,
    password: hashedPassword,
    roleCode: 1, // User mặc định
    onboardingCompleted: false
  });

  // 3. Đăng nhập luôn cho user và trả về token
  const payload = {
    id: newUser._id,
    roleCode: newUser.roleCode
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'universe-secret-key', {
    expiresIn: '7d'
  });

  return {
    token,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      roleCode: newUser.roleCode,
      onboardingCompleted: newUser.onboardingCompleted,
      currentPackage: newUser.currentPackage
    }
  };
};

module.exports = {
  loginUser,
  registerUser,
  verifyOtp
};
