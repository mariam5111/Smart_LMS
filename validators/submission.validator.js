const Joi = require('joi');
const validate = require('../middleware/validate');

const createSubmissionSchema = Joi.object({
  assignmentId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.empty': 'Assignment ID is required',
      'string.hex': 'Invalid Assignment ID format',
      'string.length': 'Invalid Assignment ID length',
      'any.required': 'Assignment ID is required',
    }),
  content: Joi.string().trim().required().messages({
    'string.empty': 'Submission content is required',
  }),
});

const gradeSubmissionSchema = Joi.object({
  score: Joi.number().min(0).required().messages({
    'number.base': 'Score must be a number',
    'number.min': 'Score cannot be negative',
    'any.required': 'Score is required',
  }),
});

module.exports = {
  createSubmissionValidation: validate(createSubmissionSchema),
  gradeSubmissionValidation: validate(gradeSubmissionSchema),
};