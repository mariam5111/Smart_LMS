const courseService = require('../services/course.service');

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const result = await courseService.getAllCourses(filters);
    res.status(200).json({
      success: true,
      data: result.results,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};