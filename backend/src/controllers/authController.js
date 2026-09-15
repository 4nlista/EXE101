const authService = require('../services/authService');
const { loginSchema, registerSchema, verifyOtpSchema, forgotPasswordSchema, verifyForgotOtpSchema, resetPasswordSchema } = require('../validations/authValidation');

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
    // 1. Validate dữ liệu đầu vào (email, otp, password)
    const { error, value } = verifyOtpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, otp, password } = value;
    
    // 2. Gọi logic xử lý từ Service
    const { token, user } = await authService.verifyOtp(email, otp, password);

    // 3. Trả về Response thành công kèm token và thông tin user
    res.status(201).json({
      success: true,
      message: 'Đăng ký và xác thực tài khoản thành công',
      data: {
        token,
        user
      }
    });
  } catch (err) {
    // 4. Đẩy lỗi cho error handling middleware
    next(err);
  }
};

/**
 * Controller xử lý API Đăng nhập bằng Google
 * POST /api/auth/login-google
 */
const loginGoogle = async (req, res, next) => {
  try {
    const { error, value } = require('../validations/authValidation').loginGoogleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { token } = value;
    const result = await authService.loginGoogle(token);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller xử lý API Quên mật khẩu (Gửi mã OTP về email)
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email } = value;
    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller xử lý API Xác thực OTP quên mật khẩu
 * POST /api/auth/verify-forgot-otp
 */
const verifyForgotOtp = async (req, res, next) => {
  try {
    const { error, value } = verifyForgotOtpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, otp } = value;
    const result = await authService.verifyForgotOtp(email, otp);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller xử lý API Đặt lại mật khẩu
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, newPassword } = value;
    const result = await authService.resetPassword(email, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  register,
  verifyOtp,
  loginGoogle,
  forgotPassword,
  verifyForgotOtp,
  resetPassword
};
