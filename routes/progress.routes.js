const express = require('express');
const progressController = require('../controllers/progress.controller');
const { markLessonValidation } = require('../validators/progress.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Learning progress engine
 */

router.use(protect);

/**
 * @swagger
 * /progress/lessons/complete:
 *   post:
 *     summary: Mark a lesson as completed (Student)
 *     tags: [Progress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId]
 *             properties:
 *               lessonId: { type: string }
 *     responses:
 *       200: { description: Lesson marked as completed }
 *       403: { description: Not enrolled }
 *       404: { description: Lesson not found }
 */
router.post(
  '/lessons/complete',
  restrictTo('Student'),
  markLessonValidation,
  progressController.markLesson
);

/**
 * @swagger
 * /progress/lessons/uncomplete:
 *   post:
 *     summary: Mark a lesson as not completed (Student)
 *     tags: [Progress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId]
 *             properties:
 *               lessonId: { type: string }
 *     responses:
 *       200: { description: Lesson marked as not completed }
 */
router.post(
  '/lessons/uncomplete',
  restrictTo('Student'),
  markLessonValidation,
  progressController.unmarkLesson
);

/**
 * @swagger
 * /progress/enrollments/{enrollmentId}:
 *   get:
 *     summary: Get detailed progress for an enrollment (owner / instructor / admin)
 *     tags: [Progress]
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detailed progress }
 *       403: { description: Forbidden }
 *       404: { description: Enrollment not found }
 */
router.get('/enrollments/:enrollmentId', progressController.getProgress);

module.exports = router;