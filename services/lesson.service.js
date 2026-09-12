const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const createLesson = async (courseId, lessonData) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const lesson = await Lesson.create({
    ...lessonData,
    course: courseId,
  });

  return lesson;
};

const getLessonsByCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
  return lessons;
};

const getLessonById = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }
  return lesson;
};

const updateLesson = async (lessonId, updateData) => {
  const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }
  return lesson;
};

const deleteLesson = async (lessonId) => {
  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }
  return lesson;
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
};