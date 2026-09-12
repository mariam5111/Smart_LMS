const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const checkCourseOwnership = require('../middleware/checkCourseOwnership');

const router = express.Router({ mergeParams: true });

router.use(protect);

/**
 * @swagger
 * /courses/{courseId}/enrollments:
 *   get:
 *     summary: Get all enrollments for a course (instructor or admin)
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of enrollments }
 *       403: { description: Forbidden }
 */
router.get(
  '/',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  enrollmentController.getCourseEnrollments
);

module.exports = router;