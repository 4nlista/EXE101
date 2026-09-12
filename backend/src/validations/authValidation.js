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
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu không khớp.',
    'any.required': 'Vui lòng xác nhận mật khẩu.'
  })
});

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
  name: Joi.string().allow('', null)
});

const loginGoogleSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token Google không được để trống.',
    'any.required': 'Vui lòng cung cấp Token Google.'
  })
});

// Schema validate cho Quên mật khẩu (chỉ cần email)
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ.',
    'string.empty': 'Email không được để trống.',
    'any.required': 'Vui lòng nhập Email.'
  })
});

// Schema validate cho Đặt lại mật khẩu (email + mật khẩu mới + xác nhận)
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
  resetPasswordSchema
};
