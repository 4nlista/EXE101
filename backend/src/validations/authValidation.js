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

module.exports = {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  loginGoogleSchema
};
