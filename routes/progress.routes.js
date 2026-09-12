const express = require('express');
const progressController = require('../controllers/progress.controller');
const { markLessonValidation } = require('../validators/progress.validator');
const protect = require('../middleware/protect');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();

router.use(protect);

router.post(
  '/lessons/complete',
  restrictTo('Student'),
  markLessonValidation,
  progressController.markLesson
);


router.post(
  '/lessons/uncomplete',
  restrictTo('Student'),
  markLessonValidation,
  progressController.unmarkLesson
);

router.get('/enrollments/:enrollmentId', progressController.getProgress);

module.exports = router;