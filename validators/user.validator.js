const Joi = require('joi');
const validate = require('../middleware/validate');

const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  bio: Joi.string().trim().max(500).allow(''),
  expertise: Joi.array().items(Joi.string().trim()),
  yearsOfExperience: Joi.number().integer().min(0).max(70),
}).min(1);

module.exports = {
  registerValidation: validate(registerSchema),
  loginValidation: validate(loginSchema),
  updateProfileValidation: validate(updateProfileSchema),
};