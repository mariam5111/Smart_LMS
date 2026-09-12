const express = require('express');
const courseController = require('../controllers/course.controller');
const {
  createCourseValidation,
  updateCourseValidation,
} = require('../validators/course.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const checkCourseOwnership = require('../middleware/checkCourseOwnership');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: List all courses (search, filter, pagination)
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in title/description
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Course found }
 *       404: { description: Course not found }
 */
router.get('/:id', courseController.getCourse);

// All routes below require auth
router.use(protect);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title: { type: string, example: "JavaScript Basics" }
 *               description: { type: string }
 *               category: { type: string, example: "Programming" }
 *               price: { type: number, example: 0 }
 *               status: { type: string, enum: [draft, published, archived] }
 *     responses:
 *       201: { description: Course created }
 *       403: { description: Forbidden }
 */
router.post(
  '/',
  restrictTo('Instructor', 'Admin'),
  createCourseValidation,
  courseController.createCourse
);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course (owner instructor or admin)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               price: { type: number }
 *               status: { type: string, enum: [draft, published, archived] }
 *     responses:
 *       200: { description: Course updated }
 *       403: { description: Forbidden }
 *       404: { description: Course not found }
 */
router.put(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  updateCourseValidation,
  courseController.updateCourse
);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course (owner instructor or admin)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Course deleted }
 *       403: { description: Forbidden }
 *       404: { description: Course not found }
 */
router.delete(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  courseController.deleteCourse
);

module.exports = router;