const Joi = require('joi');

const applyProjectSchema = Joi.object({
  note: Joi.string().max(500).required().messages({
    'string.max': 'Ghi chú không được vượt quá 500 ký tự.',
    'string.empty': 'Vui lòng nhập ghi chú ứng tuyển.',
    'any.required': 'Vui lòng nhập ghi chú ứng tuyển.'
  })
});

module.exports = { applyProjectSchema };
