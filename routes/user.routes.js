const express = require('express');
const userController = require('../controllers/user.controller');
const { registerValidation, loginValidation } = require('../validators/user.validator');
const protect = require('../middleware/protect');

const router = express.Router();

router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/refresh', userController.refresh);
router.get('/profile', protect, userController.getProfile);

module.exports = router;