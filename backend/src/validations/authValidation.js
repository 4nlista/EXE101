const Joi = require('joi');

/**
 * Schema validate dữ liệu đầu vào cho Login
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'string.empty': 'Mật khẩu không được để trống.',
    'any.required': 'Vui lòng nhập mật khẩu.'
  })
});

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'string.empty': 'Mật khẩu không được để trống.',
    'any.required': 'Vui lòng nhập mật khẩu.'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).optional().messages({
    'any.only': 'Xác nhận mật khẩu không khớp.'
  })
});

// Schema validate cho Xác thực OTP và hoàn tất đăng ký
const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'Mã OTP phải bao gồm 6 ký tự.',
    'string.empty': 'Mã OTP không được để trống.',
    'any.required': 'Vui lòng nhập mã OTP.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'string.empty': 'Mật khẩu không được để trống.',
    'any.required': 'Vui lòng cung cấp mật khẩu để hoàn tất đăng ký.'
  })
});

const loginGoogleSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token Google không được để trống.',
    'any.required': 'Vui lòng cung cấp Token Google.'
  })
});

// Schema validate cho Quên mật khẩu - Bước 1 (chỉ cần email)
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  })
});

// Schema validate cho Quên mật khẩu - Bước 2: Xác thực OTP 4 số
const verifyForgotOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  }),
  otp: Joi.string().length(4).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Mã OTP phải gồm 4 chữ số.',
    'string.pattern.base': 'Mã OTP chỉ chứa các chữ số.',
    'string.empty': 'Mã OTP không được để trống.',
    'any.required': 'Vui lòng nhập mã OTP.'
  })
});

// Schema validate cho Đặt lại mật khẩu (chỉ cần email + mật khẩu mới)
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
    'string.empty': 'Mật khẩu mới không được để trống.',
    'any.required': 'Vui lòng nhập mật khẩu mới.'
  }),
  confirmNewPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Xác nhận mật khẩu không khớp.',
    'any.required': 'Vui lòng xác nhận mật khẩu mới.'
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  loginGoogleSchema,
  forgotPasswordSchema,
  verifyForgotOtpSchema,
  resetPasswordSchema
};
