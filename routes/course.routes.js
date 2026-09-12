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

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Protected routes (Instructor/Admin only)
router.use(protect); // all routes below require authentication

router.post(
  '/',
  restrictTo('Instructor', 'Admin'),
  createCourseValidation,
  courseController.createCourse
);

router.put(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  updateCourseValidation,
  courseController.updateCourse
);

router.delete(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  courseController.deleteCourse
);

module.exports = router;