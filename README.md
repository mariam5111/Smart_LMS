# 🎓 SLMS— Smart Learning Management System

A robust, secure, and scalable RESTful backend API for managing online learning programs — students, instructors, courses, lessons, assignments, submissions, reviews, and learning progress. Built with **Node.js**, **Express.js**, and **MongoDB**, following professional backend architecture with clean separation of concerns, centralized error handling, role-based access control, and an advanced **Learning Progress Engine**.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Installation](#-installation)
5. [Environment Variables](#-environment-variables)
6. [Running the App](#-running-the-app)
7. [Authentication](#-authentication)
8. [User Roles](#-user-roles)
9. [API Endpoints](#-api-endpoints)
10. [Advanced Backend Features](#-advanced-backend-features)
11. [Testing](#-testing)
12. [Database Setup](#-database-setup)
13. [Deployment](#-deployment)
14. [License](#-license)
15. [Author](#-author)

---

## ✨ Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication with Access & Refresh Tokens
  - Role-Based Access Control (`Student`, `Instructor`, `Admin`)
  - Password hashing with `bcryptjs`
  - Public registration is restricted to `Student` only; `Instructor` and `Admin` are promoted via the database

- **📚 Course Management**
  - Full CRUD for courses (Instructor / Admin only)
  - Categories, pricing, statuses (draft / published / archived)
  - Search, filtering, and pagination
  - Public browsing of published courses

- **📖 Lesson Management**
  - Ordered lessons inside each course
  - Duration tracking
  - Full CRUD by course owner (Instructor) or Admin

- **📝 Enrollment System**
  - Students enroll in published courses only
  - Prevents duplicate enrollment
  - Auto-increments / decrements enrollment count
  - Students can drop their enrollments

- **📋 Assignments & Submissions**
  - Instructors create assignments with deadlines and max scores
  - Students submit before deadline (only one submission per assignment)
  - Instructors grade submissions
  - Score cannot exceed max score

- **📊 Learning Progress Engine** (Advanced Feature)
  - Automatically calculates completion percentage
  - Tracks completed lessons and graded assignments
  - Auto-updates enrollment status to `completed` at 100%
  - Provides detailed breakdown: remaining lessons, remaining assignments

- **⭐ Reviews & Ratings**
  - Students can review courses only after completing them
  - One review per student per course (enforced by a unique index)
  - Automatic recalculation of the course's `ratingAverage` via Aggregation Pipeline
  - Admins can delete any abusive review
  - Public endpoint to browse all reviews of a course

- **👨‍🏫 Instructor Profiles**
  - Extended profile fields: `bio`, `expertise`, `yearsOfExperience`
  - Instructors update their own profile via `PATCH /api/users/profile`
  - Public endpoint `GET /api/users/instructors/:id` returns the profile + their published courses

- **📈 Aggregation & Dashboards**
  - Admin, Instructor, and Student dashboards
  - Uses MongoDB Aggregation Pipelines (`$lookup`, `$group`, `$avg`, `$cond`, `$round`)

- **🛡️ Data Validation & Error Handling**
  - Request body validation using **Joi**
  - Centralized global error handling via custom `AppError`
  - Consistent response structure: `{ success, message, data }`
  - Proper HTTP status codes (400, 401, 403, 404, 409, 500)

- **⚡ Performance**
  - MongoDB Indexes on frequently queried fields
  - Atomic operations for enrollment counters (`$inc`)
  - `$text` search indexes for courses
  - Unique indexes to prevent duplicates

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose ODM |
| Authentication | JSON Web Tokens (JWT) + BcryptJS |
| Validation | Joi |
| Documentation | Swagger (OpenAPI 3.0) |
| Testing | Postman, Swagger UI |
| Linting | ESLint |

---

## 📁 Project Structure

```text
Smart_LMS/
├── config/
│   ├── db.js
│   └── swagger.js
├── controllers/
│   ├── assignment.controller.js
│   ├── course.controller.js
│   ├── dashboard.controller.js
│   ├── enrollment.controller.js
│   ├── lesson.controller.js
│   ├── progress.controller.js
│   ├── review.controller.js
│   ├── submission.controller.js
│   └── user.controller.js
├── middleware/
│   ├── checkAssignmentOwnership.js
│   ├── checkCourseOwnership.js
│   ├── errorHandler.js
│   ├── protect.js
│   ├── restrictTo.js
│   └── validate.js
├── models/
│   ├── assignment.model.js
│   ├── course.model.js
│   ├── enrollment.model.js
│   ├── lesson.model.js
│   ├── lessonProgress.model.js
│   ├── review.model.js
│   ├── submission.model.js
│   └── user.model.js
├── routes/
│   ├── assignment.routes.js
│   ├── course.routes.js
│   ├── courseEnrollment.routes.js
│   ├── dashboard.routes.js
│   ├── enrollment.routes.js
│   ├── lesson.routes.js
│   ├── progress.routes.js
│   ├── review.routes.js
│   ├── reviewStandalone.routes.js
│   ├── submission.routes.js
│   └── user.routes.js
├── services/
│   ├── assignment.service.js
│   ├── course.service.js
│   ├── dashboard.service.js
│   ├── enrollment.service.js
│   ├── lesson.service.js
│   ├── progress.service.js
│   ├── review.service.js
│   ├── submission.service.js
│   └── user.service.js
├── utils/
│   ├── appError.js
│   └── generateToken.js
├── validators/
│   ├── assignment.validator.js
│   ├── course.validator.js
│   ├── enrollment.validator.js
│   ├── lesson.validator.js
│   ├── progress.validator.js
│   ├── review.validator.js
│   ├── submission.validator.js
│   └── user.validator.js
├── .env.example
├── .gitignore
├── app.js
├── eslint.config.mjs
├── package.json
├── README.md
└── server.js
```

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mariam5111/Smart_LMS.git
   cd lms-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and copy the contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Fill in your environment variables** (see [Environment Variables](#-environment-variables)).

5. **Run the app** (see [Running the App](#-running-the-app)).

6. **Access API Docs:**
   Open [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in your browser.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lms_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d
```

| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing access tokens |
| `JWT_EXPIRES_IN` | Access token lifespan (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan (e.g. `7d`) |

---

## ▶️ Running the App

```bash
# Development
npm run dev

# Production
npm start

# Lint check
npm run lint

# Lint auto-fix
npm run lint:fix
```

---

## 🔑 Authentication

The API uses **JWT Bearer tokens**.

1. **Register a new user** (always as `Student`):
   ```
   POST /api/users/register
   ```

2. **Login** to receive `token` and `refreshToken`:
   ```
   POST /api/users/login
   ```

3. **Include the token** in the header of protected requests:
   ```
   Authorization: Bearer <your_access_token>
   ```

4. **Refresh access token** when it expires:
   ```
   POST /api/users/refresh
   Body: { "refreshToken": "..." }
   ```

5. **Promoting a user to `Instructor` or `Admin`** must be done directly in MongoDB (e.g. via Compass):
   ```json
   { "role": "Instructor" }
   ```

---

## 👥 User Roles

| Role | Permissions |
| :--- | :--- |
| **Student** | Browse courses, enroll, view lessons, submit assignments, review completed courses, view own progress and dashboard |
| **Instructor** | Everything Student can do + create/manage own courses, lessons, assignments, grade submissions, update own profile (bio, expertise, experience), view own dashboard |
| **Admin** | Full access to everything, view all dashboards, delete any review or resource, promote users via DB |

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### 👤 Users

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/users/register` | Register as Student | Public |
| POST | `/users/login` | Login & get tokens | Public |
| POST | `/users/refresh` | Refresh access token | Public |
| GET | `/users/profile` | Get current user profile | Authenticated |
| PATCH | `/users/profile` | Update current user profile (name, bio, expertise, yearsOfExperience) | Authenticated |
| GET | `/users/instructors/:id` | Get instructor public profile with published courses | Public |

### 📚 Courses

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/courses` | List all published courses (search, filter, pagination) | Public |
| GET | `/courses/:id` | Get a single course | Public |
| POST | `/courses` | Create a course | Instructor / Admin |
| PUT | `/courses/:id` | Update a course | Owner Instructor / Admin |
| DELETE | `/courses/:id` | Delete a course | Owner Instructor / Admin |

### 📖 Lessons

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/courses/:courseId/lessons` | Get lessons of a course | Authenticated |
| POST | `/courses/:courseId/lessons` | Create a lesson | Owner Instructor / Admin |
| PUT | `/courses/:courseId/lessons/:id` | Update a lesson | Owner Instructor / Admin |
| DELETE | `/courses/:courseId/lessons/:id` | Delete a lesson | Owner Instructor / Admin |

### 📝 Enrollments

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/enrollments` | Enroll in a course | Student |
| GET | `/enrollments/my-enrollments` | Get my enrollments | Authenticated |
| GET | `/enrollments/:id` | Get single enrollment | Owner / Instructor / Admin |
| PATCH | `/enrollments/:id/drop` | Drop enrollment | Owner Student |
| GET | `/courses/:courseId/enrollments` | Get all enrollments for a course | Owner Instructor / Admin |

### 📋 Assignments

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/courses/:courseId/assignments` | Get course assignments | Authenticated |
| POST | `/courses/:courseId/assignments` | Create assignment | Owner Instructor / Admin |
| PUT | `/courses/:courseId/assignments/:id` | Update assignment | Owner Instructor / Admin |
| DELETE | `/courses/:courseId/assignments/:id` | Delete assignment | Owner Instructor / Admin |

### 📤 Submissions

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/submissions` | Submit an assignment | Student (enrolled) |
| GET | `/submissions/my-submissions` | Get my submissions | Student |
| GET | `/submissions/assignment/:assignmentId` | Get submissions for assignment | Owner Instructor / Admin |
| GET | `/submissions/:id` | Get single submission | Owner / Instructor / Admin |
| PATCH | `/submissions/:id/grade` | Grade a submission | Owner Instructor / Admin |
| PUT | `/submissions/:id` | Update own submission (before deadline) | Student |

### 📊 Progress

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/progress/lessons/complete` | Mark lesson as completed | Student (enrolled) |
| POST | `/progress/lessons/uncomplete` | Mark lesson as not completed | Student (enrolled) |
| GET | `/progress/enrollments/:enrollmentId` | Detailed progress for an enrollment | Owner / Instructor / Admin |

### ⭐ Reviews

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/courses/:courseId/reviews` | List all reviews for a course (with avg rating) | Public |
| POST | `/courses/:courseId/reviews` | Create a review | Student (enrolled + completed) |
| GET | `/reviews/:id` | Get single review by ID | Public |
| PUT | `/reviews/:id` | Update own review | Review Owner |
| DELETE | `/reviews/:id` | Delete review | Owner / Admin |

### 📈 Dashboard

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/dashboard/admin` | Admin aggregated stats | Admin |
| GET | `/dashboard/instructor` | Instructor aggregated stats | Instructor / Admin |
| GET | `/dashboard/student` | Student aggregated stats | Student |

---

## 🧠 Advanced Backend Features

### 1. Learning Progress Engine

For each enrollment, progress is calculated as:

```
progressPercentage = (completedLessons + gradedSubmissions) / (totalLessons + totalAssignments) × 100
```

**Rules:**

- A lesson counts when the student marks it via `/progress/lessons/complete`.
- An assignment counts when the instructor grades the student's submission.
- When `progressPercentage` reaches **100%**, the enrollment `status` is automatically set to `completed`.
- Progress is **recalculated automatically** after marking/unmarking a lesson or grading a submission.

**Example Response:**

```json
{
  "success": true,
  "data": {
    "progressPercentage": 78,
    "status": "active",
    "lessons": {
      "total": 18,
      "completed": 14,
      "remaining": 4,
      "completedIds": ["..."],
      "remainingList": [ { "title": "Lesson 15", "order": 15 } ]
    },
    "assignments": {
      "total": 6,
      "graded": 5,
      "remaining": 1
    }
  }
}
```

### 2. Reviews Rating Engine

The `ratingAverage` of each course is recalculated automatically after any review is created, updated, or deleted — using a MongoDB Aggregation Pipeline (`$group` + `$avg`) instead of manual math.

### 3. Aggregation Dashboards

All dashboards use MongoDB Aggregation Pipelines to compute statistics server-side.

**Example — Top Courses:**

```js
Course.aggregate([
  { $sort: { enrollmentCount: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: 'users',
      localField: 'instructor',
      foreignField: '_id',
      as: 'instructor',
    },
  },
  { $unwind: '$instructor' },
  { $project: { title: 1, enrollmentCount: 1, 'instructor.name': 1 } },
]);
```

---

## 🧪 Testing

### Option 1: Swagger UI (Recommended)

Open [http://localhost:5000/api-docs](http://localhost:5000/api-docs).

- Click **Authorize** and paste your access token.
- Use **Try it out** on each endpoint.

### Option 2: Postman Collection

A ready-to-use Postman collection is included: `LMS_API.postman_collection.json`.

**Setup:**

1. Import the collection into Postman.
2. Collection Variables include:
   - `baseUrl` — defaults to `http://localhost:5000/api`
   - `token` — auto-saved after student login
   - `refreshToken` — auto-saved after student login
   - `instructorToken`, `instructorId` — auto-saved after instructor login
   - `adminToken` — auto-saved after admin login
   - `courseId`, `lessonId`, `enrollmentId`, `assignmentId`, `submissionId`, `reviewId` — auto-saved after creating resources

3. Use the chained requests in order:
   **Users → Courses → Lessons → Enrollments → Assignments → Submissions → Progress → Reviews → Dashboard**.

**Promoting users for testing:**

- Register a user via `/users/register` (they'll be a `Student`).
- Promote to `Instructor` or `Admin` in MongoDB Compass:
  ```json
  { "role": "Instructor" }
  ```
- Re-login to get a token reflecting the new role.

---

## 🗄️ Database Setup

- **Database name:** `lms_db` (or anything you choose in `MONGO_URI`)
- **Collections:** `users`, `courses`, `lessons`, `enrollments`, `assignments`, `submissions`, `lessonprogresses`, `reviews`

**Indexes:**

| Collection | Index |
| :--- | :--- |
| `users` | `email` (unique) |
| `courses` | `title + description` (text), `category`, `instructor`, `status` |
| `lessons` | `course + order` |
| `enrollments` | `student + course` (unique) |
| `assignments` | `course` |
| `submissions` | `student + assignment` (unique), `assignment` |
| `lessonprogresses` | `student + lesson` (unique), `student + course` |
| `reviews` | `student + course` (unique), `course` |

---

## 🚢 Deployment

### Recommended Platforms

- **Backend:** [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io)
- **Database:** MongoDB Atlas (free tier)

### Deployment Steps (Render example)

1. Push your code to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your repo.
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (`MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, etc.).
6. Deploy 🚀
7. Update the Swagger `servers.url` in `config/swagger.js` to your live URL.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Mariam Shahat Hamada**

- GitHub: [@mariam5111](https://github.com/mariam5111)

---

⭐ If you found this project useful, please consider giving it a star on GitHub!