const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const {
  createEnrollmentValidation,
} = require('../validators/enrollment.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

// All enrollment routes require authentication
router.use(protect);

// Student enrolls in a course
router.post(
  '/',
  restrictTo('Student'),
  createEnrollmentValidation,
  enrollmentController.enroll
);

// Student gets their own enrollments
router.get('/my-enrollments', enrollmentController.getMyEnrollments);

// Get single enrollment (owner/instructor/admin)
router.get('/:id', enrollmentController.getEnrollment);

// Student drops their enrollment
router.patch(
  '/:id/drop',
  restrictTo('Student'),
  enrollmentController.dropEnrollment
);

module.exports = router;