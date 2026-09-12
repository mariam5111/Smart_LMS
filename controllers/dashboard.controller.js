const dashboardService = require('../services/dashboard.service');

// ===== Admin =====
const getAdminDashboard = async (req, res, next) => {
  try {
    const overview = await dashboardService.getAdminOverview();
    const topCourses = await dashboardService.getTopCourses(5);
    const progressByCategory = await dashboardService.getAvgProgressByCategory();

    res.status(200).json({
      success: true,
      data: {
        overview,
        topCourses,
        progressByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== Instructor =====
const getInstructorDashboard = async (req, res, next) => {
  try {
    const overview = await dashboardService.getInstructorOverview(req.user._id);
    const topStudents = await dashboardService.getTopStudentsByInstructor(
      req.user._id,
      5
    );

    res.status(200).json({
      success: true,
      data: {
        overview,
        topStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== Student =====
const getStudentDashboard = async (req, res, next) => {
  try {
    const overview = await dashboardService.getStudentOverview(req.user._id);
    const coursesProgress = await dashboardService.getStudentCoursesProgress(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: {
        overview,
        courses: coursesProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getInstructorDashboard,
  getStudentDashboard,
};