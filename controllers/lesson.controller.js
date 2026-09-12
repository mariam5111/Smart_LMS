const lessonService = require('../services/lesson.service');

const createLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.createLesson(req.params.courseId, req.body);
    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

const getLessonsByCourse = async (req, res, next) => {
  try {
    const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

const getLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);
    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.updateLesson(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    await lessonService.deleteLesson(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLesson,
  updateLesson,
  deleteLesson,
};