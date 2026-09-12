const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/emailSender');

/**
 * Tạo mã OTP ngẫu nhiên 6 số (dùng cho đăng ký)
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Tạo mã OTP ngẫu nhiên 4 số (dùng cho quên mật khẩu)
 */
const generateForgotOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
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
    error.statusCode = 401;
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
    const error = new Error('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
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

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'your-google-client-id');

/**
 * Xử lý đăng nhập bằng Google
 */
const loginGoogle = async (googleToken) => {
  // 1. Verify token với Google
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    });
  } catch (error) {
    const err = new Error('Xác thực Google thất bại hoặc Token đã hết hạn.');
    err.statusCode = 401;
    throw err;
  }

  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;

  // 2. Tìm hoặc tạo User trong DB
  let user = await User.findOne({ email });

  if (!user) {
    // Tạo user mới nếu chưa tồn tại
    user = await User.create({
      email,
      name,
      avatar: picture,
      googleId,
      roleCode: 1, // User mặc định
      onboardingCompleted: false, // Yêu cầu nhập hồ sơ
      isActive: 1
    });
  } else {
    // Nếu user đã tồn tại (đăng ký bằng email thường) nhưng giờ login google, ta link googleId lại
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
    }
    user.isActive = 1;
    await user.save();
  }

  // 3. Tạo JWT Token
  const jwtPayload = {
    id: user._id,
    roleCode: user.roleCode
  };

  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'universe-secret-key', {
    expiresIn: '7d'
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
 * Quên mật khẩu - Kiểm tra email + Tạo và gửi OTP 4 số về email
 */
const forgotPassword = async (email) => {
  // Tìm user theo email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email này chưa được đăng ký trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }

  // Chặn nếu tài khoản được tạo bằng Google (không có mật khẩu để reset)
  if (!user.password) {
    const error = new Error('Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.');
    error.statusCode = 400;
    throw error;
  }

  // Tạo mã OTP 4 số
  const otpCode = generateForgotOTP();

  // Xóa OTP cũ của type 'forgot' của email này
  await Otp.deleteMany({ email, type: 'forgot' });

  // Lưu OTP vào DB (hết hạn sau 15 phút)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await Otp.create({
    email,
    code: otpCode,
    type: 'forgot',
    expiresAt
  });

  // Gửi email chứa mã OTP
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #E07B2A; text-align: center;">UniVerse AI</h2>
      <p>Xin chào <strong>${user.name || email}</strong>,</p>
      <p>Bạn đang yêu cầu đặt lại mật khẩu. Đây là mã xác thực (OTP) của bạn:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; padding: 12px 32px; font-size: 32px; font-weight: bold; background-color: #FEF3E9; color: #E07B2A; letter-spacing: 10px; border-radius: 8px; border: 2px solid #E07B2A;">${otpCode}</span>
      </div>
      <p style="color: #ef4444; font-size: 14px;">Mã này có hiệu lực trong <strong>15 phút</strong>. Vui lòng không chia sẻ cho bất kỳ ai.</p>
      <p style="color: #6B7280; font-size: 13px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
    </div>
  `;
  await sendEmail(email, 'Mã xác thực đặt lại mật khẩu UniVerse AI', htmlContent);

  return { message: 'Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.' };
};

/**
 * Quên mật khẩu - Xác thực mã OTP 4 số
 */
const verifyForgotOtp = async (email, otp) => {
  // Tìm OTP còn hiệu lực (chưa dùng, đúng type 'forgot')
  const otpRecord = await Otp.findOne({ email, type: 'forgot', isUsed: false }).sort({ createdAt: -1 });

  if (!otpRecord) {
    const error = new Error('Không tìm thấy mã OTP hoặc mã đã được sử dụng. Vui lòng gửi lại.');
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra hết hạn
  if (otpRecord.expiresAt < new Date()) {
    const error = new Error('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra mã OTP
  if (otpRecord.code !== otp) {
    const error = new Error('Mã OTP không chính xác. Vui lòng kiểm tra lại.');
    error.statusCode = 400;
    throw error;
  }

  // Đánh dấu OTP đã xác thực thành công (isVerified = true, isUsed = true)
  otpRecord.isUsed = true;
  otpRecord.isVerified = true;
  await otpRecord.save();

  return { message: 'Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.' };
};

/**
 * Đặt lại mật khẩu mới cho tài khoản
 * Bắc buộc phải có OTP đã được xác thực trước đó
 */
const resetPassword = async (email, newPassword) => {
  // Kiểm tra OTP đã verify chưa (bảo mật: chặn bypass)
  const verifiedOtp = await Otp.findOne({ email, type: 'forgot', isVerified: true });
  if (!verifiedOtp) {
    const error = new Error('Phiên xác thực không hợp lệ. Vui lòng thực hiện lại từ bước nhập email.');
    error.statusCode = 403;
    throw error;
  }

  // Tìm user theo email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email không tồn tại.');
    error.statusCode = 404;
    throw error;
  }

  // Mã hóa mật khẩu mới và cập nhật vào database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();

  // Xóa OTP đã dùng khỏi DB
  await Otp.deleteMany({ email, type: 'forgot' });

  return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' };
};

module.exports = {
  loginUser,
  registerUser,
  verifyOtp,
  loginGoogle,
  forgotPassword,
  verifyForgotOtp,
  resetPassword
};
