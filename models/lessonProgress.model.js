const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ student: 1, course: 1 });

const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
module.exports = LessonProgress;