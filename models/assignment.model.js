const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assignment title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide assignment description'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Please provide max score'],
      min: [1, 'Max score must be at least 1'],
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;