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

// Get all lessons for a course (public? or protected? Let's make it public for now, but could be protected)
router.get('/', lessonController.getLessonsByCourse);

// Protected routes (Instructor/Admin only)
router.use(protect);

router.post(
  '/',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership, // ensures the instructor owns the course (params.courseId)
  createLessonValidation,
  lessonController.createLesson
);

router.put(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  updateLessonValidation,
  lessonController.updateLesson
);

router.delete(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  lessonController.deleteLesson
);

module.exports = router;