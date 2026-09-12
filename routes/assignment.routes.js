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

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Assignments inside courses
 */

router.use(protect);

/**
 * @swagger
 * /courses/{courseId}/assignments:
 *   get:
 *     summary: Get all assignments of a course
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of assignments }
 *       404: { description: Course not found }
 */
router.get('/', assignmentController.getAssignmentsByCourse);

/**
 * @swagger
 * /courses/{courseId}/assignments:
 *   post:
 *     summary: Create a new assignment (Instructor of the course or Admin)
 *     tags: [Assignments]
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
 *             required: [title, description, deadline, maxScore]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               deadline: { type: string, format: date-time }
 *               maxScore: { type: integer, example: 100 }
 *     responses:
 *       201: { description: Assignment created }
 *       403: { description: Forbidden }
 */
router.post(
  '/',
  restrictTo('Instructor', 'Admin'),
  checkCourseOwnership,
  createAssignmentValidation,
  assignmentController.createAssignment
);

/**
 * @swagger
 * /courses/{courseId}/assignments/{id}:
 *   put:
 *     summary: Update an assignment
 *     tags: [Assignments]
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
 *               description: { type: string }
 *               deadline: { type: string, format: date-time }
 *               maxScore: { type: integer }
 *     responses:
 *       200: { description: Assignment updated }
 *       403: { description: Forbidden }
 *       404: { description: Assignment not found }
 */
router.put(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkAssignmentOwnership,
  updateAssignmentValidation,
  assignmentController.updateAssignment
);

/**
 * @swagger
 * /courses/{courseId}/assignments/{id}:
 *   delete:
 *     summary: Delete an assignment
 *     tags: [Assignments]
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
 *       200: { description: Assignment deleted }
 *       403: { description: Forbidden }
 *       404: { description: Assignment not found }
 */
router.delete(
  '/:id',
  restrictTo('Instructor', 'Admin'),
  checkAssignmentOwnership,
  assignmentController.deleteAssignment
);

module.exports = router;