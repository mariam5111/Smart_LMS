const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated statistics and reports
 */

router.use(protect);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Admin dashboard overview
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Aggregated admin statistics
 *       403:
 *         description: Forbidden
 */
router.get('/admin', restrictTo('Admin'), dashboardController.getAdminDashboard);

/**
 * @swagger
 * /dashboard/instructor:
 *   get:
 *     summary: Instructor dashboard overview
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Aggregated instructor statistics
 *       403:
 *         description: Forbidden
 */
router.get(
  '/instructor',
  restrictTo('Instructor', 'Admin'),
  dashboardController.getInstructorDashboard
);

/**
 * @swagger
 * /dashboard/student:
 *   get:
 *     summary: Student dashboard overview
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Aggregated student statistics
 *       403:
 *         description: Forbidden
 */
router.get('/student', restrictTo('Student'), dashboardController.getStudentDashboard);

module.exports = router;