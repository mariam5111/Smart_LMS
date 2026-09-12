const Assignment = require('../models/assignment.model');
const Course = require('../models/course.model');
const AppError = require('../utils/appError');

const createAssignment = async (courseId, assignmentData) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const assignment = await Assignment.create({
    ...assignmentData,
    course: courseId,
  });

  return assignment;
};

const getAssignmentsByCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const assignments = await Assignment.find({ course: courseId }).sort({
    deadline: 1,
  });

  return assignments;
};

const getAssignmentById = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId).populate(
    'course',
    'title instructor'
  );
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  return assignment;
};

const updateAssignment = async (assignmentId, updateData) => {
  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  return assignment;
};

const deleteAssignment = async (assignmentId) => {
  const assignment = await Assignment.findByIdAndDelete(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  return assignment;
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};