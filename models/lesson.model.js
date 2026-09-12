const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide lesson content'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Lesson must belong to a course'],
    },
    order: {
      type: Number,
      required: [true, 'Please provide lesson order'],
      min: [1, 'Order must be at least 1'],
    },
    duration: {
      type: Number, // in minutes
      min: [1, 'Duration must be at least 1 minute'],
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;