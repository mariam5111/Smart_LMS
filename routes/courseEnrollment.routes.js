const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const checkCourseOwnership = require('../middleware/checkCourseOwnership');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Get all enrollments for a specific course (instructor/admin only)
router.get(
  '/',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  enrollmentController.getCourseEnrollments
);

module.exports = router;