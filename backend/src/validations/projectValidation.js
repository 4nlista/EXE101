const Joi = require('joi');

const createProjectSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    'string.base': 'Tiêu đề dự án phải là kiểu chữ.',
    'string.empty': 'Vui lòng không để trống tiêu đề dự án.',
    'string.max': 'Tiêu đề dự án không vượt quá 150 ký tự.',
    'any.required': 'Vui lòng nhập tiêu đề dự án.'
  }),
  description: Joi.string().trim().max(3000).required().messages({
    'string.base': 'Tổng quan dự án phải là kiểu chữ.',
    'string.empty': 'Vui lòng không để trống tổng quan dự án.',
    'string.max': 'Tổng quan dự án không vượt quá 3000 ký tự.',
    'any.required': 'Vui lòng nhập tổng quan dự án.'
  }),
  candidateRequirements: Joi.string().trim().max(2000).required().messages({
    'string.base': 'Yêu cầu ứng viên phải là kiểu chữ.',
    'string.empty': 'Vui lòng không để trống yêu cầu ứng viên.',
    'string.max': 'Yêu cầu ứng viên không vượt quá 2000 ký tự.',
    'any.required': 'Vui lòng nhập yêu cầu ứng viên.'
  }),
  departmentIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('ID ngành học không hợp lệ.')).min(1).required().messages({
    'array.base': 'Ngành học phải là một danh sách.',
    'array.min': 'Vui lòng chọn ít nhất một ngành học.',
    'any.required': 'Vui lòng chọn ngành học liên quan.'
  }),
  gradeTarget: Joi.number().min(0).max(10).required().messages({
    'number.base': 'Mục tiêu điểm phải là một số.',
    'number.min': 'Mục tiêu điểm không được nhỏ hơn 0.',
    'number.max': 'Mục tiêu điểm không được lớn hơn 10.',
    'any.required': 'Vui lòng nhập mục tiêu điểm dự án.'
  }),
  maxMembers: Joi.number().integer().min(1).required().messages({
    'number.base': 'Số lượng tuyển phải là một số.',
    'number.integer': 'Số lượng tuyển phải là số nguyên.',
    'number.min': 'Số lượng tuyển tối thiểu là 1 người.',
    'any.required': 'Vui lòng nhập số lượng cần tuyển.'
  }),
  deadline: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Hạn ứng tuyển không đúng định dạng ngày tháng.',
    'date.format': 'Hạn ứng tuyển phải theo chuẩn ISO.',
    'date.greater': 'Hạn ứng tuyển phải là ngày trong tương lai (không tính ngày hiện tại hay quá khứ).',
    'any.required': 'Vui lòng nhập hạn ứng tuyển.'
  })
});

const updateProjectSchema = Joi.object({
  title: Joi.string().trim().max(150),
  description: Joi.string().trim().max(3000),
  candidateRequirements: Joi.string().trim().max(2000),
  departmentIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  gradeTarget: Joi.number().min(0).max(10),
  maxMembers: Joi.number().integer().min(1),
  deadline: Joi.date().iso().greater('now')
});

module.exports = { 
  createProjectSchema,
  updateProjectSchema
};
