const enrollmentService = require('../services/enrollment.service');
const AppError = require('../utils/appError');

const enroll = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const enrollment = await enrollmentService.enrollInCourse(req.user._id, courseId);

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getMyEnrollments(req.user._id);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

const getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.getEnrollmentById(
      req.params.id,
      req.user
    );

    // Check authorization: only owner, course instructor, or admin
    const isOwner = enrollment.student._id.toString() === req.user._id.toString();
    const isInstructor =
      enrollment.course.instructor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isInstructor && !isAdmin) {
      return next(new AppError('You are not authorized to view this enrollment', 403));
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getCourseEnrollments(
      req.params.courseId
    );

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

const dropEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.dropCourse(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Enrollment dropped successfully',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enroll,
  getMyEnrollments,
  getEnrollment,
  getCourseEnrollments,
  dropEnrollment,
};