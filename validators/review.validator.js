const Joi = require('joi');
const validate = require('../middleware/validate');

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Comment cannot exceed 500 characters',
  }),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
  comment: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Comment cannot exceed 500 characters',
  }),
}).min(1);

module.exports = {
  createReviewValidation: validate(createReviewSchema),
  updateReviewValidation: validate(updateReviewSchema),
};