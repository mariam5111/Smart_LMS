const express = require('express');
const reviewController = require('../controllers/review.controller');
const { updateReviewValidation } = require('../validators/review.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by ID (public)
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Review not found
 */
router.get('/:id', reviewController.getReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review (owner only)
 *     tags: [Reviews]
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
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.put(
  '/:id',
  protect,
  updateReviewValidation,
  reviewController.updateReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.delete(
  '/:id',
  protect,
  restrictTo('Student', 'Admin'),
  reviewController.deleteReview
);

module.exports = router;