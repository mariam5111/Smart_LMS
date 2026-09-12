const LessonProgress = require('../models/lessonProgress.model');
const Enrollment = require('../models/enrollment.model');
const Lesson = require('../models/lesson.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const AppError = require('../utils/appError');

/**
 * Recalculate progress for an enrollment.
 * Progress = (completed lessons + graded submissions) / (total lessons + total assignments) * 100
 * Also updates status to 'completed' when 100%.
 */
const recalculateProgress = async (enrollmentId) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  const courseId = enrollment.course;
  const studentId = enrollment.student;

  // total lessons & assignments in the course
  const totalLessons = await Lesson.countDocuments({ course: courseId });
  const totalAssignments = await Assignment.countDocuments({ course: courseId });
  const totalItems = totalLessons + totalAssignments;

  // completed lessons
  const completedLessons = await LessonProgress.countDocuments({
    student: studentId,
    course: courseId,
    completed: true,
  });

  // graded submissions (assignments done)
  const gradedSubmissions = await Submission.countDocuments({
    student: studentId,
    status: 'graded',
    assignment: {
      $in: await Assignment.find({ course: courseId }).distinct('_id'),
    },
  });

  const completedItems = completedLessons + gradedSubmissions;

  const progress =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  enrollment.progressPercentage = progress;

  // auto update status
  if (progress >= 100) {
    enrollment.status = 'completed';
  } else if (enrollment.status !== 'dropped') {
    enrollment.status = 'active';
  }

  await enrollment.save();

  return {
    courseId,
    progressPercentage: progress,
    completedLessons,
    totalLessons,
    gradedSubmissions,
    totalAssignments,
    status: enrollment.status,
  };
};

/**
 * Mark a lesson as completed (or uncompleted) for a student.
 */
const markLesson = async (studentId, lessonId, completed = true) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: lesson.course,
  });
  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  if (enrollment.status === 'dropped') {
    throw new AppError('You have dropped this course', 400);
  }

  // Upsert lesson progress
  const lessonProgress = await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      student: studentId,
      lesson: lessonId,
      course: lesson.course,
      completed,
      completedAt: completed ? new Date() : null,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Recalculate overall progress
  const progress = await recalculateProgress(enrollment._id);

  return { lessonProgress, progress };
};

/**
 * Get detailed progress for a course enrollment.
 */
const getCourseProgress = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('course', 'title')
    .populate('student', 'name email');
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  // authorization
  const isOwner = enrollment.student._id.toString() === user._id.toString();
  const isAdmin = user.role === 'Admin';
  let isInstructor = false;

  if (!isOwner && !isAdmin) {
    // check if user is the course instructor
    const course = await require('../models/course.model').findById(
      enrollment.course._id
    );
    isInstructor =
      course && course.instructor.toString() === user._id.toString();
  }

  if (!isOwner && !isAdmin && !isInstructor) {
    throw new AppError('You are not authorized to view this progress', 403);
  }

  const courseId = enrollment.course._id;
  const studentId = enrollment.student._id;

  const totalLessons = await Lesson.countDocuments({ course: courseId });
  const totalAssignments = await Assignment.countDocuments({ course: courseId });

  const completedLessons = await LessonProgress.countDocuments({
    student: studentId,
    course: courseId,
    completed: true,
  });

  const assignmentIds = await Assignment.find({ course: courseId }).distinct('_id');
  const gradedSubmissions = await Submission.countDocuments({
    student: studentId,
    status: 'graded',
    assignment: { $in: assignmentIds },
  });

  const lessonProgresses = await LessonProgress.find({
    student: studentId,
    course: courseId,
  }).populate('lesson', 'title order duration');

  // Which lessons are still remaining
  const completedLessonIds = lessonProgresses
    .filter((lp) => lp.completed)
    .map((lp) => lp.lesson._id.toString());

  const allLessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

  const remainingLessons = allLessons.filter(
    (l) => !completedLessonIds.includes(l._id.toString())
  );

  return {
    enrollmentId: enrollment._id,
    course: enrollment.course,
    student: enrollment.student,
    progressPercentage: enrollment.progressPercentage,
    status: enrollment.status,
    lessons: {
      total: totalLessons,
      completed: completedLessons,
      remaining: totalLessons - completedLessons,
      completedIds: completedLessonIds,
      remainingList: remainingLessons,
    },
    assignments: {
      total: totalAssignments,
      graded: gradedSubmissions,
      remaining: totalAssignments - gradedSubmissions,
    },
  };
};

module.exports = {
  recalculateProgress,
  markLesson,
  getCourseProgress,
};