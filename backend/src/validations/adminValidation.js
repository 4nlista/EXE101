const Joi = require('joi');

// Schema validate lý do khóa tài khoản
const lockUserSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(500).required().messages({
    'string.base': 'Lý do khóa tài khoản phải là chuỗi ký tự.',
    'string.empty': 'Vui lòng nhập lý do khóa tài khoản.',
    'string.min': 'Lý do khóa tài khoản phải có ít nhất 5 ký tự.',
    'string.max': 'Lý do khóa tài khoản không vượt quá 500 ký tự.',
    'any.required': 'Vui lòng cung cấp lý do khóa tài khoản.'
  })
});

// Schema validate kiểm duyệt dự án (đình chỉ / gỡ bỏ / khôi phục)
const moderateProjectSchema = Joi.object({
  action: Joi.string().valid('suspend', 'delete', 'restore').required().messages({
    'string.base': 'Hành động kiểm duyệt không hợp lệ.',
    'any.only': 'Hành động chỉ có thể là suspend (đình chỉ), delete (xóa) hoặc restore (khôi phục).',
    'any.required': 'Vui lòng chọn hành động kiểm duyệt.'
  }),
  reason: Joi.string().trim().min(10).max(1000).required().messages({
    'string.base': 'Lý do kiểm duyệt phải là chuỗi ký tự.',
    'string.empty': 'Vui lòng nhập lý do kiểm duyệt bài đăng.',
    'string.min': 'Lý do kiểm duyệt phải có ít nhất 10 ký tự để người dùng hiểu rõ.',
    'string.max': 'Lý do kiểm duyệt không vượt quá 1000 ký tự.',
    'any.required': 'Bắt buộc phải nêu rõ lý do kiểm duyệt dự án.'
  })
});

// Schema validate tạo chuyên ngành mới
const createMajorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Tên chuyên ngành phải là chuỗi ký tự.',
    'string.empty': 'Vui lòng không để trống tên chuyên ngành.',
    'string.min': 'Tên chuyên ngành phải có ít nhất 2 ký tự.',
    'string.max': 'Tên chuyên ngành không vượt quá 100 ký tự.',
    'any.required': 'Vui lòng nhập tên chuyên ngành.'
  }),
  departmentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'ID ngành học không đúng định dạng.',
    'any.required': 'Vui lòng chọn ngành học cho chuyên ngành này.'
  })
});

// Schema validate tạo ngành học mới
const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Tên ngành học phải là chuỗi ký tự.',
    'string.empty': 'Vui lòng không để trống tên ngành học.',
    'string.min': 'Tên ngành học phải có ít nhất 2 ký tự.',
    'string.max': 'Tên ngành học không vượt quá 100 ký tự.',
    'any.required': 'Vui lòng nhập tên ngành học.'
  }),
  description: Joi.string().trim().max(500).allow('').optional().messages({
    'string.base': 'Mô tả ngành học phải là chuỗi ký tự.',
    'string.max': 'Mô tả ngành học không vượt quá 500 ký tự.'
  })
});

// Schema validate tạo kỹ năng mới
const createSkillSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'Tên kỹ năng phải là chuỗi ký tự.',
    'string.empty': 'Vui lòng không để trống tên kỹ năng.',
    'string.min': 'Tên kỹ năng phải có ít nhất 2 ký tự.',
    'string.max': 'Tên kỹ năng không vượt quá 50 ký tự.',
    'any.required': 'Vui lòng nhập tên kỹ năng.'
  })
});

module.exports = {
  lockUserSchema,
  moderateProjectSchema,
  createDepartmentSchema,
  createMajorSchema,
  createSkillSchema
};
