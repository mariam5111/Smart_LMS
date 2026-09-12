const Joi = require('joi');
const validate = require('../middleware/validate');

const createCourseSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required',
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required',
  }),
  category: Joi.string().trim().required().messages({
    'string.empty': 'Category is required',
  }),
  price: Joi.number().min(0).default(0),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  category: Joi.string().trim(),
  price: Joi.number().min(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
}).min(1);

module.exports = {
  createCourseValidation: validate(createCourseSchema),
  updateCourseValidation: validate(updateCourseSchema),
};