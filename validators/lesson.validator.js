const Joi = require('joi');
const validate = require('../middleware/validate');

const createLessonSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required',
  }),
  content: Joi.string().trim().required().messages({
    'string.empty': 'Content is required',
  }),
  order: Joi.number().integer().min(1).required().messages({
    'number.base': 'Order must be a number',
    'number.min': 'Order must be at least 1',
  }),
  duration: Joi.number().integer().min(1).messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 minute',
  }),
});

const updateLessonSchema = Joi.object({
  title: Joi.string().trim(),
  content: Joi.string().trim(),
  order: Joi.number().integer().min(1),
  duration: Joi.number().integer().min(1),
}).min(1);

module.exports = {
  createLessonValidation: validate(createLessonSchema),
  updateLessonValidation: validate(updateLessonSchema),
};