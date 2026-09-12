const progressService = require('../services/progress.service');

const markLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const result = await progressService.markLesson(req.user._id, lessonId, true);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const unmarkLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const result = await progressService.markLesson(req.user._id, lessonId, false);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as not completed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getCourseProgress(
      req.params.enrollmentId,
      req.user
    );

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markLesson,
  unmarkLesson,
  getProgress,
};