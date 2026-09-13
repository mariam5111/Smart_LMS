const User = require('../models/User.model');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'Student', 
  });

  user.password = undefined;
  return {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
};
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isCorrectPassword = await user.comparePassword(password);
  if (!isCorrectPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.password = undefined;
 const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };


  if (user.role === 'Instructor') {
    userData.bio = user.bio;
    userData.expertise = user.expertise;
    userData.yearsOfExperience = user.yearsOfExperience;
  }

  return { user: userData, token, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }
    const newAccessToken = generateToken(user._id, user.role);
    return { token: newAccessToken };
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
const updateUserProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'bio', 'expertise', 'yearsOfExperience'];
  const filteredData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  if (Object.keys(filteredData).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};


const getInstructorProfile = async (instructorId) => {
  const instructor = await User.findById(instructorId);

  if (!instructor) {
    throw new AppError('Instructor not found', 404);
  }

  if (instructor.role !== 'Instructor' && instructor.role !== 'Admin') {
    throw new AppError('This user is not an instructor', 404);
  }

  const Course = require('../models/course.model');
  const courses = await Course.find({
    instructor: instructorId,
    status: 'published',
  }).select('title description category enrollmentCount ratingAverage price');

  return {
    _id: instructor._id,
    name: instructor.name,
    email: instructor.email,
    bio: instructor.bio,
    expertise: instructor.expertise,
    yearsOfExperience: instructor.yearsOfExperience,
    courses,
  };
};
module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserById,
  updateUserProfile,
  getInstructorProfile,
};