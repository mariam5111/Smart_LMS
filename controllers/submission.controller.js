const submissionService = require('../services/submission.service');

const createSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.createSubmission(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await submissionService.getMySubmissions(req.user._id);

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

const getSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissionsByAssignment = async (req, res, next) => {
  try {
    const submissions = await submissionService.getSubmissionsByAssignment(
      req.params.assignmentId,
      req.user
    );

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.gradeSubmission(
      req.params.id,
      req.body.score,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.updateSubmission(
      req.params.id,
      req.body.content,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmission,
  getSubmissionsByAssignment,
  gradeSubmission,
  updateSubmission,
};