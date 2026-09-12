const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const userRouter = require('./routes/user.routes');
const courseRouter = require('./routes/course.routes');
const lessonRouter = require('./routes/lesson.routes');
const enrollmentRouter = require('./routes/enrollment.routes');
const courseEnrollmentRouter = require('./routes/courseEnrollment.routes');
const assignmentRouter = require('./routes/assignment.routes');
const submissionRouter = require('./routes/submission.routes');
const progressRouter = require('./routes/progress.routes');
const dashboardRouter = require('./routes/dashboard.routes');

const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/courses/:courseId/lessons', lessonRouter);
app.use('/api/courses/:courseId/enrollments', courseEnrollmentRouter);
app.use('/api/courses/:courseId/assignments', assignmentRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/submissions', submissionRouter);
app.use('/api/progress', progressRouter);
app.use('/api/dashboard', dashboardRouter);

// 404
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;