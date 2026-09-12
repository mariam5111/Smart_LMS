const express = require('express');
const submissionController = require('../controllers/submission.controller');
const {
  createSubmissionValidation,
  gradeSubmissionValidation,
} = require('../validators/submission.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Assignment submissions and grading
 */

router.use(protect);

/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Submit an assignment (Student only)
 *     tags: [Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignmentId, content]
 *             properties:
 *               assignmentId: { type: string }
 *               content: { type: string }
 *     responses:
 *       201: { description: Submission created }
 *       400: { description: Deadline passed }
 *       403: { description: Not enrolled }
 *       409: { description: Already submitted }
 */
router.post(
  '/',
  restrictTo('Student'),
  createSubmissionValidation,
  submissionController.createSubmission
);

/**
 * @swagger
 * /submissions/my-submissions:
 *   get:
 *     summary: Get my submissions
 *     tags: [Submissions]
 *     responses:
 *       200: { description: List of my submissions }
 */
router.get('/my-submissions', submissionController.getMySubmissions);

/**
 * @swagger
 * /submissions/assignment/{assignmentId}:
 *   get:
 *     summary: Get all submissions for an assignment (Instructor or Admin)
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of submissions }
 *       403: { description: Forbidden }
 */
router.get(
  '/assignment/:assignmentId',
  restrictTo('Instructor', 'Admin'),
  submissionController.getSubmissionsByAssignment
);

/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get a single submission (owner, instructor, or admin)
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Submission found }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.get('/:id', submissionController.getSubmission);

/**
 * @swagger
 * /submissions/{id}/grade:
 *   patch:
 *     summary: Grade a submission (Instructor or Admin)
 *     tags: [Submissions]
 *     parameters:
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
 *             required: [score]
 *             properties:
 *               score: { type: number, example: 85 }
 *     responses:
 *       200: { description: Submission graded }
 *       400: { description: Score exceeds max }
 *       403: { description: Forbidden }
 */
router.patch(
  '/:id/grade',
  restrictTo('Instructor', 'Admin'),
  gradeSubmissionValidation,
  submissionController.gradeSubmission
);

/**
 * @swagger
 * /submissions/{id}:
 *   put:
 *     summary: Update my submission (Student only, before deadline)
 *     tags: [Submissions]
 *     parameters:
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
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       200: { description: Submission updated }
 *       400: { description: Deadline passed or already graded }
 *       403: { description: Forbidden }
 */
router.put('/:id', restrictTo('Student'), submissionController.updateSubmission);

module.exports = router;