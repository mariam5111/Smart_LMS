const express = require('express');
const lessonController = require('../controllers/lesson.controller');
const {
  createLessonValidation,
  updateLessonValidation,
} = require('../validators/lesson.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const checkCourseOwnership = require('../middleware/checkCourseOwnership');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Lessons inside a course
 */

/**
 * @swagger
 * /courses/{courseId}/lessons:
 *   get:
 *     summary: Get all lessons of a course
 *     tags: [Lessons]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of lessons }
 *       404: { description: Course not found }
 */
router.get('/', lessonController.getLessonsByCourse);

router.use(protect);

/**
 * @swagger
 * /courses/{courseId}/lessons:
 *   post:
 *     summary: Create a lesson (Instructor of the course or Admin)
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, order]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               order: { type: integer, example: 1 }
 *               duration: { type: integer, example: 15 }
 *     responses:
 *       201: { description: Lesson created }
 *       403: { description: Forbidden }
 */
router.post(
  '/',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  createLessonValidation,
  lessonController.createLesson
);

/**
 * @swagger
 * /courses/{courseId}/lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
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
 *               content: { type: string }
 *               order: { type: integer }
 *               duration: { type: integer }
 *     responses:
 *       200: { description: Lesson updated }
 *       403: { description: Forbidden }
 *       404: { description: Lesson not found }
 */
router.put(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  updateLessonValidation,
  lessonController.updateLesson
);

/**
 * @swagger
 * /courses/{courseId}/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lesson deleted }
 *       403: { description: Forbidden }
 *       404: { description: Lesson not found }
 */
router.delete(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  lessonController.deleteLesson
);

module.exports = router;