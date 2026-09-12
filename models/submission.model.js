const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide your submission content'],
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      default: null,
      min: [0, 'Score cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });
submissionSchema.index({ assignment: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;