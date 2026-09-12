const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const createCourse = async (courseData, instructorId) => {
  const course = await Course.create({
    ...courseData,
    instructor: instructorId,
  });
  return course;
};

const getAllCourses = async (filters = {}) => {
  const { search, category, status, page = 1, limit = 10 } = filters;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  } else {
    // By default, only show published courses to public
    query.status = 'published';
  }

  const skip = (page - 1) * limit;

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Course.countDocuments(query);

  return {
    results: courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId).populate('instructor', 'name email');
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  return course;
};

const updateCourse = async (courseId, updateData) => {
  const course = await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  return course;
};

const deleteCourse = async (courseId) => {
  const course = await Course.findByIdAndDelete(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  return course;
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};