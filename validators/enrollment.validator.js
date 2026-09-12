const Joi = require('joi');
const validate = require('../middleware/validate');

const createEnrollmentSchema = Joi.object({
  courseId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.empty': 'Course ID is required',
      'string.hex': 'Invalid Course ID format',
      'string.length': 'Invalid Course ID length',
      'any.required': 'Course ID is required',
    }),
});

module.exports = {
  createEnrollmentValidation: validate(createEnrollmentSchema),
};