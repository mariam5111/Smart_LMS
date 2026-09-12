const Submission = require('../models/submission.model');
const Assignment = require('../models/assignment.model');
const Enrollment = require('../models/enrollment.model');
const AppError = require('../utils/appError');


const createSubmission = async (studentId, submissionData) => {
  const { assignmentId, content } = submissionData;

  const assignment = await Assignment.findById(assignmentId).populate('course');
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

 
  if (new Date() > assignment.deadline) {
    throw new AppError('Deadline has passed', 400);
  }

  
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: assignment.course._id,
    status: { $ne: 'dropped' },
  });

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  
  const existing = await Submission.findOne({
    student: studentId,
    assignment: assignmentId,
  });
  if (existing) {
    throw new AppError('You have already submitted this assignment', 409);
  }

  const submission = await Submission.create({
    student: studentId,
    assignment: assignmentId,
    content,
  });

  return submission;
};

const getMySubmissions = async (studentId) => {
  return await Submission.find({ student: studentId })
    .populate({
      path: 'assignment',
      select: 'title maxScore deadline',
      populate: { path: 'course', select: 'title' },
    })
    .sort({ submittedAt: -1 });
};

const getSubmissionById = async (submissionId, user) => {
  const submission = await Submission.findById(submissionId)
    .populate('student', 'name email')
    .populate({
      path: 'assignment',
      populate: { path: 'course', select: 'title instructor' },
    });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const isOwner = submission.student._id.toString() === user._id.toString();
  const isInstructor =
    submission.assignment.course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'Admin';

  if (!isOwner && !isInstructor && !isAdmin) {
    throw new AppError('You are not authorized to view this submission', 403);
  }

  return submission;
};

const getSubmissionsByAssignment = async (assignmentId, user) => {
  const assignment = await Assignment.findById(assignmentId).populate('course');
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (
    user.role !== 'Admin' &&
    assignment.course.instructor.toString() !== user._id.toString()
  ) {
    throw new AppError('You are not authorized to view these submissions', 403);
  }

  return await Submission.find({ assignment: assignmentId })
    .populate('student', 'name email')
    .sort({ submittedAt: -1 });
};

const gradeSubmission = async (submissionId, score, user) => {
  const submission = await Submission.findById(submissionId).populate({
    path: 'assignment',
    populate: { path: 'course', select: 'instructor' },
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const isInstructor =
    submission.assignment.course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'Admin';

  if (!isInstructor && !isAdmin) {
    throw new AppError('You are not authorized to grade this submission', 403);
  }

  if (score > submission.assignment.maxScore) {
    throw new AppError(
      `Score cannot exceed ${submission.assignment.maxScore}`,
      400
    );
  }

  submission.score = score;
  submission.status = 'graded';
  await submission.save();

  const enrollment = await Enrollment.findOne({
    student: submission.student,
    course: submission.assignment.course._id,
  });
  if (enrollment) {
    const progressService = require('./progress.service');
    await progressService.recalculateProgress(enrollment._id);
  }

  return submission;
};

const updateSubmission = async (submissionId, content, user) => {
  const submission = await Submission.findById(submissionId).populate('assignment');
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }
  if (!content) {
    throw new AppError('Submission content is required', 400);
  }
  if (submission.student.toString() !== user._id.toString()) {
    throw new AppError('You can only update your own submission', 403);
  }

  if (submission.status === 'graded') {
    throw new AppError('Cannot update a graded submission', 400);
  }

  if (new Date() > submission.assignment.deadline) {
    throw new AppError('Deadline has passed, cannot update submission', 400);
  }

  submission.content = content;
  submission.submittedAt = Date.now();
  await submission.save();

  return submission;
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  getSubmissionsByAssignment,
  gradeSubmission,
  updateSubmission,
};