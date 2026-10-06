const Joi = require('joi');

const createReviewValidate = Joi.object({
  projectId: Joi.string().required().messages({
    'string.empty': 'projectId không được để trống',
    'any.required': 'projectId là bắt buộc'
  }),
  revieweeId: Joi.string().required().messages({
    'string.empty': 'revieweeId không được để trống',
    'any.required': 'revieweeId là bắt buộc'
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Đánh giá tối thiểu 1 sao',
    'number.max': 'Đánh giá tối đa 5 sao',
    'any.required': 'rating là bắt buộc'
  })
});

module.exports = {
  createReviewValidate
};
