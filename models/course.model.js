const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must have an instructor'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;