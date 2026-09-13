const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS API',
      version: '1.0.0',
      description:
        'Smart Learning Management System API — Courses, Lessons, Enrollments, Assignments, Submissions, and Progress Engine.',
    },
    servers: [
      {
        url: 'https://smartlms-production-9af4.up.railway.app/api',
      
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['Student', 'Instructor', 'Admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Course: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            instructor: { type: 'string' },
            price: { type: 'number' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            enrollmentCount: { type: 'number' },
            ratingAverage: { type: 'number' },
          },
        },
        Lesson: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            course: { type: 'string' },
            order: { type: 'number' },
            duration: { type: 'number' },
          },
        },
        Enrollment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            student: { type: 'string' },
            course: { type: 'string' },
            progressPercentage: { type: 'number' },
            status: { type: 'string', enum: ['active', 'completed', 'dropped'] },
          },
        },
        Assignment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            course: { type: 'string' },
            deadline: { type: 'string', format: 'date-time' },
            maxScore: { type: 'number' },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            student: { type: 'string' },
            assignment: { type: 'string' },
            content: { type: 'string' },
            score: { type: 'number', nullable: true },
            status: { type: 'string', enum: ['pending', 'graded'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;