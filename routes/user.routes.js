const express = require('express');
const userController = require('../controllers/user.controller');
const { registerValidation, loginValidation, updateProfileValidation} = require('../validators/user.validator');
const protect = require('../middleware/protect');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authentication & user profile
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user (always Student)
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mariam Shahat"
 *               email:
 *                 type: string
 *                 example: "student@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/register', registerValidation, userController.register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login and receive access + refresh tokens
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, userController.login);

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', userController.refresh);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', protect, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update current user's profile (name, bio, expertise, yearsOfExperience)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mariam Shahat"
 *               bio:
 *                 type: string
 *                 example: "Senior developer with 10 years of experience"
 *               expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Node.js", "MongoDB"]
 *               yearsOfExperience:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: No valid fields to update
 *       401:
 *         description: Not authenticated
 */
router.patch(
  '/profile',
  protect,
  updateProfileValidation,
  userController.updateProfile
);

/**
 * @swagger
 * /users/instructors/{id}:
 *   get:
 *     summary: Get instructor public profile with their published courses
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Instructor profile retrieved
 *       404:
 *         description: Instructor not found
 */
router.get('/instructors/:id', userController.getInstructorProfile);


module.exports = router;