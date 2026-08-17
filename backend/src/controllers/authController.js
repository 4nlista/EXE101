const authService = require('../services/authService');
const { loginSchema, registerSchema, verifyOtpSchema } = require('../validations/authValidation');

/**
 * Controller xử lý API Đăng nhập
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // 1. Validate dữ liệu đầu vào
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // 2. Gọi logic xử lý từ Service
    const { email, password } = value;
    const { token, user } = await authService.loginUser(email, password);

    // 3. Trả về Response thành công
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user
      }
    });
  } catch (err) {
    // 4. Bắt lỗi và đẩy cho errorHandler xử lý
    next(err);
  }
};

/**
 * Controller xử lý API Đăng ký (Tạo OTP)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = value;
    const result = await authService.registerUser(email, password);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller xử lý API Xác thực OTP (Tạo User)
 * POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res, next) => {
  try {
    // Để verify otp, client cần gửi lại password để tạo User vì ta ko cache password lúc đăng ký
    // Bổ sung password vào schema tạm thời bằng code
    const { error, value } = verifyOtpSchema.validate({ email: req.body.email, otp: req.body.otp });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mật khẩu để hoàn tất đăng ký.'
      });
    }

    const { email, otp } = value;
    const { password } = req.body;
    
    const { token, user } = await authService.verifyOtp(email, otp, password);

    res.status(201).json({
      success: true,
      message: 'Đăng ký và xác thực thành công',
      data: {
        token,
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  register,
  verifyOtp
};
