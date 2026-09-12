const express = require('express');
const reviewController = require('../controllers/review.controller');
const {
  createReviewValidation,
} = require('../validators/review.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Course reviews and ratings
 */

/**
 * @swagger
 * /courses/{courseId}/reviews:
 *   get:
 *     summary: Get all reviews for a course (public)
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of reviews with average rating
 *       404:
 *         description: Course not found
 */
router.get('/', reviewController.getCourseReviews);

/**
 * @swagger
 * /courses/{courseId}/reviews:
 *   post:
 *     summary: Create a review for a course (Student only, must have completed the course)
 *     tags: [Reviews]
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
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Excellent course, learned a lot!"
 *     responses:
 *       201:
 *         description: Review created successfully
 *       403:
 *         description: Not enrolled or course not completed
 *       409:
 *         description: Already reviewed
 */
router.post(
  '/',
  protect,
  restrictTo('Student'),
  createReviewValidation,
  reviewController.createReview
);

module.exports = router;