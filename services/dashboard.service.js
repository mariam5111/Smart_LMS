const mongoose = require('mongoose');
const Course = require('../models/course.model');
const User = require('../models/User.model');
const Enrollment = require('../models/enrollment.model');
const Submission = require('../models/submission.model');
const Assignment = require('../models/assignment.model');



const getAdminOverview = async () => {
  const [usersByRole, totalCourses, coursesByStatus, totalEnrollments, totalSubmissions] =
    await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Course.countDocuments(),
      Course.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Enrollment.countDocuments(),
      Submission.countDocuments(),
    ]);

  return {
    users: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    courses: {
      total: totalCourses,
      byStatus: coursesByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
    enrollments: totalEnrollments,
    submissions: totalSubmissions,
  };
};


const getTopCourses = async (limit = 5) => {
  const courses = await Course.aggregate([
    { $sort: { enrollmentCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'instructor',
        foreignField: '_id',
        as: 'instructor',
      },
    },
    { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        category: 1,
        enrollmentCount: 1,
        ratingAverage: 1,
        status: 1,
        'instructor.name': 1,
        'instructor.email': 1,
      },
    },
  ]);

  return courses;
};


const getAvgProgressByCategory = async () => {
  const result = await Enrollment.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $group: {
        _id: '$course.category',
        avgProgress: { $avg: '$progressPercentage' },
        totalEnrollments: { $sum: 1 },
      },
    },
    { $sort: { avgProgress: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        avgProgress: { $round: ['$avgProgress', 2] },
        totalEnrollments: 1,
      },
    },
  ]);

  return result;
};

const getInstructorOverview = async (instructorId) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

 
  const courses = await Course.find({ instructor: instructorObjectId }).select(
    '_id title'
  );
  const courseIds = courses.map((c) => c._id);

  if (courseIds.length === 0) {
    return {
      totalCourses: 0,
      totalStudents: 0,
      totalAssignments: 0,
      totalSubmissions: 0,
      courses: [],
    };
  }

  const [totalStudents, totalAssignments, totalSubmissions, progressByCourse] =
    await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Assignment.countDocuments({ course: { $in: courseIds } }),
      Submission.aggregate([
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentDoc',
          },
        },
        { $unwind: '$assignmentDoc' },
        { $match: { 'assignmentDoc.course': { $in: courseIds } } },
        { $count: 'total' },
      ]),
      Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        {
          $group: {
            _id: '$course',
            avgProgress: { $avg: '$progressPercentage' },
            students: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: '$course' },
        {
          $project: {
            _id: 0,
            courseId: '$_id',
            courseTitle: '$course.title',
            avgProgress: { $round: ['$avgProgress', 2] },
            students: 1,
            completed: 1,
          },
        },
        { $sort: { avgProgress: -1 } },
      ]),
    ]);

  return {
    totalCourses: courses.length,
    totalStudents,
    totalAssignments,
    totalSubmissions: totalSubmissions[0]?.total || 0,
    courses: progressByCourse,
  };
};


const getTopStudentsByInstructor = async (instructorId, limit = 5) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

  const courseIds = await Course.find({ instructor: instructorObjectId }).distinct(
    '_id'
  );

  const result = await Submission.aggregate([
   
    { $match: { status: 'graded', score: { $ne: null } } },
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignment',
        foreignField: '_id',
        as: 'assignmentDoc',
      },
    },
    { $unwind: '$assignmentDoc' },
    { $match: { 'assignmentDoc.course': { $in: courseIds } } },
    {
      $group: {
        _id: '$student',
        avgScore: { $avg: '$score' },
        totalGraded: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        _id: 0,
        studentId: '$_id',
        name: '$student.name',
        email: '$student.email',
        avgScore: { $round: ['$avgScore', 2] },
        totalGraded: 1,
      },
    },
  ]);

  return result;
};

const getStudentOverview = async (studentId) => {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const [enrollmentsStats, submissionsStats] = await Promise.all([
    Enrollment.aggregate([
      { $match: { student: studentObjectId } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          dropped: {
            $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] },
          },
          avgProgress: { $avg: '$progressPercentage' },
        },
      },
    ]),
    Submission.aggregate([
      { $match: { student: studentObjectId } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          graded: {
            $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] },
          },
          avgScore: {
            $avg: {
              $cond: [{ $eq: ['$status', 'graded'] }, '$score', null],
            },
          },
        },
      },
    ]),
  ]);

  const e = enrollmentsStats[0] || {
    totalEnrollments: 0,
    completed: 0,
    active: 0,
    dropped: 0,
    avgProgress: 0,
  };

  const s = submissionsStats[0] || {
    totalSubmissions: 0,
    graded: 0,
    avgScore: 0,
  };

  return {
    enrollments: {
      total: e.totalEnrollments,
      completed: e.completed,
      active: e.active,
      dropped: e.dropped,
      avgProgress: Math.round((e.avgProgress || 0) * 100) / 100,
    },
    submissions: {
      total: s.totalSubmissions,
      graded: s.graded,
      avgScore: Math.round((s.avgScore || 0) * 100) / 100,
    },
  };
};


const getStudentCoursesProgress = async (studentId) => {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const result = await Enrollment.aggregate([
    { $match: { student: studentObjectId } },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $lookup: {
        from: 'users',
        localField: 'course.instructor',
        foreignField: '_id',
        as: 'instructor',
      },
    },
    { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        enrollmentId: '$_id',
        courseId: '$course._id',
        courseTitle: '$course.title',
        category: '$course.category',
        instructorName: '$instructor.name',
        progressPercentage: 1,
        status: 1,
        enrolledAt: 1,
      },
    },
    { $sort: { enrolledAt: -1 } },
  ]);

  return result;
};

module.exports = {
  getAdminOverview,
  getTopCourses,
  getAvgProgressByCategory,
  getInstructorOverview,
  getTopStudentsByInstructor,
  getStudentOverview,
  getStudentCoursesProgress,
};