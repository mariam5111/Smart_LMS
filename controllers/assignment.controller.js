const assignmentService = require('../services/assignment.service');

const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(
      req.params.courseId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const assignments = await assignmentService.getAssignmentsByCourse(
      req.params.courseId
    );

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignment(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignment,
  updateAssignment,
  deleteAssignment,
};