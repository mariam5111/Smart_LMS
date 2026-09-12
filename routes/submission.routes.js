const express = require('express');
const submissionController = require('../controllers/submission.controller');
const {
  createSubmissionValidation,
  gradeSubmissionValidation,
} = require('../validators/submission.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

// All submission routes require authentication
router.use(protect);

// Student submits an assignment
router.post(
  '/',
  restrictTo('Student'),
  createSubmissionValidation,
  submissionController.createSubmission
);

// Student gets their own submissions
router.get('/my-submissions', submissionController.getMySubmissions);

// Instructor/Admin gets all submissions for a specific assignment
router.get(
  '/assignment/:assignmentId',
  restrictTo('Instructor', 'Admin'),
  submissionController.getSubmissionsByAssignment
);

// Get a single submission (owner / instructor / admin)
router.get('/:id', submissionController.getSubmission);

// Instructor/Admin grades a submission
router.patch(
  '/:id/grade',
  restrictTo('Instructor', 'Admin'),
  gradeSubmissionValidation,
  submissionController.gradeSubmission
);

// Student updates their submission before deadline (optional)
router.put(
  '/:id',
  restrictTo('Student'),
  submissionController.updateSubmission
);

module.exports = router;