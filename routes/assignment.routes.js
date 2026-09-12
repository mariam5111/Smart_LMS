const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const {
  createAssignmentValidation,
  updateAssignmentValidation,
} = require('../validators/assignment.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');
const checkCourseOwnership = require('../middleware/checkCourseOwnership');
const checkAssignmentOwnership = require('../middleware/checkAssignmentOwnership');

const router = express.Router({ mergeParams: true });

// All assignment routes require authentication
router.use(protect);

// Get all assignments for a course
// Accessible by students enrolled + instructor + admin
router.get('/', assignmentController.getAssignmentsByCourse);

// Create assignment (Instructor/Admin only, must own course)
router.post(
  '/',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  createAssignmentValidation,
  assignmentController.createAssignment
);

// Update assignment
router.put(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkAssignmentOwnership,
  updateAssignmentValidation,
  assignmentController.updateAssignment
);

// Delete assignment
router.delete(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkAssignmentOwnership,
  assignmentController.deleteAssignment
);

module.exports = router;