const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/user.routes');
const courseRouter = require('./routes/course.routes');
const lessonRouter = require('./routes/lesson.routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/courses/:courseId/lessons', lessonRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;