const Joi = require('joi');
const validate = require('../middleware/validate');

const markLessonSchema = Joi.object({
  lessonId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.empty': 'Lesson ID is required',
      'string.hex': 'Invalid Lesson ID format',
      'string.length': 'Invalid Lesson ID length',
      'any.required': 'Lesson ID is required',
    }),
});

module.exports = {
  markLessonValidation: validate(markLessonSchema),
};