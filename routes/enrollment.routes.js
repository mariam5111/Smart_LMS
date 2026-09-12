const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const { createEnrollmentValidation } = require('../validators/enrollment.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Student enrollments in courses
 */

router.use(protect);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll a student in a course
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId: { type: string, example: "665f1a2b3c4d5e6f7g8h9i0j" }
 *     responses:
 *       201: { description: Enrolled successfully }
 *       400: { description: Course not published }
 *       403: { description: Only students can enroll }
 *       409: { description: Already enrolled }
 */
router.post(
  '/',
  restrictTo('Student'),
  createEnrollmentValidation,
  enrollmentController.enroll
);

/**
 * @swagger
 * /enrollments/my-enrollments:
 *   get:
 *     summary: Get my enrollments
 *     tags: [Enrollments]
 *     responses:
 *       200: { description: List of my enrollments }
 */
router.get('/my-enrollments', enrollmentController.getMyEnrollments);

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     summary: Get a single enrollment (owner, instructor, or admin)
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Enrollment found }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.get('/:id', enrollmentController.getEnrollment);

/**
 * @swagger
 * /enrollments/{id}/drop:
 *   patch:
 *     summary: Drop an enrollment (student only)
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Enrollment dropped }
 *       400: { description: Already dropped }
 *       403: { description: Forbidden }
 */
router.patch('/:id/drop', restrictTo('Student'), enrollmentController.dropEnrollment);

module.exports = router;