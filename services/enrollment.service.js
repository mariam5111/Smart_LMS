const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const enrollInCourse = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.status !== 'published') {
    throw new AppError('You can only enroll in published courses', 400);
  }

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    throw new AppError('You are already enrolled in this course', 409);
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
  });

  // Increment enrollment count atomically
  await Course.findByIdAndUpdate(courseId, {
    $inc: { enrollmentCount: 1 },
  });

  return enrollment;
};

const getMyEnrollments = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name email' },
    })
    .sort({ createdAt: -1 });

  return enrollments;
};

const getEnrollmentById = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findById(enrollmentId)
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name email' },
    })
    .populate('student', 'name email role');

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  return enrollment;
};

const getCourseEnrollments = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  return enrollments;
};

const dropCourse = async (enrollmentId, studentId) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  if (enrollment.student.toString() !== studentId.toString()) {
    throw new AppError('You are not authorized to drop this enrollment', 403);
  }

  if (enrollment.status === 'dropped') {
    throw new AppError('Enrollment is already dropped', 400);
  }

  enrollment.status = 'dropped';
  await enrollment.save();

  // Decrement enrollment count
  await Course.findByIdAndUpdate(enrollment.course, {
    $inc: { enrollmentCount: -1 },
  });

  return enrollment;
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentById,
  getCourseEnrollments,
  dropCourse,
};