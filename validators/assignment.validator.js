const Joi = require('joi');
const validate = require('../middleware/validate');

const createAssignmentSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required',
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required',
  }),
  deadline: Joi.date().greater('now').required().messages({
    'date.base': 'Please provide a valid date',
    'date.greater': 'Deadline must be in the future',
    'any.required': 'Deadline is required',
  }),
  maxScore: Joi.number().integer().min(1).required().messages({
    'number.base': 'Max score must be a number',
    'number.min': 'Max score must be at least 1',
    'any.required': 'Max score is required',
  }),
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  deadline: Joi.date().greater('now').messages({
    'date.base': 'Please provide a valid date',
    'date.greater': 'Deadline must be in the future',
  }),
  maxScore: Joi.number().integer().min(1).messages({
    'number.base': 'Max score must be a number',
    'number.min': 'Max score must be at least 1',
  }),
}).min(1);

module.exports = {
  createAssignmentValidation: validate(createAssignmentSchema),
  updateAssignmentValidation: validate(updateAssignmentSchema),
};