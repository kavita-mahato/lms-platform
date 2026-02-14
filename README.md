# LMS Platform

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

A full-stack Learning Management System with role-based portals for **Students** and **Educators**. Features secure authentication, Stripe payment processing, video content delivery, and progress tracking.

<!-- Add your deployed URL here -->
<!-- 🔗 **[Live Demo](https://your-deployed-url.vercel.app)** -->

## ✨ Key Features

### 🎓 Student Portal
- **Course Discovery** – Browse, search, and filter courses
- **Secure Payments** – Stripe-integrated checkout for course enrollment
- **Progress Tracking** – Track completion status across enrolled courses
- **Video Learning** – YouTube-based video player with chapter navigation
- **Course Ratings** – Rate and review completed courses

### 👨‍🏫 Educator Portal
- **Analytics Dashboard** – View earnings, enrollments, and course performance
- **Course Management** – Create, update, and delete courses with rich text descriptions
- **Media Uploads** – Cloudinary-powered image uploads for course thumbnails
- **Student Insights** – View enrolled students and their progress

### 🔐 Security & Auth
- **Clerk Authentication** – Secure sign-up/sign-in with webhook sync
- **Role-Based Access** – Protected routes for educators
- **Webhook Handling** – Secure Stripe & Clerk webhook verification

## 🛠️ Tech Stack

**Frontend:**
React • Vite • Tailwind CSS • React Router • Clerk • Quill Editor

**Backend:**
Express.js • MongoDB • Mongoose • Stripe • Cloudinary • Multer

## 📁 Project Structure

```
lms-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/
│   │   │   ├── student/    # Student-facing pages
│   │   │   └── educator/   # Educator-facing pages
│   │   ├── context/        # React context providers
│   │   └── assets/         # Static assets
│   └── public/
├── server/                 # Express backend
│   ├── configs/            # Database & service configs
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   └── server.js           # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance
- [Clerk](https://clerk.com) account
- [Stripe](https://stripe.com) account
- [Cloudinary](https://cloudinary.com) account

### Environment Variables

**Client (`client/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=backend_url || http://localhost:5000
```

**Server (`server/.env`):**
```env
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Installation

```bash
# Clone the repository
git clone https://github.com/kavita-mahato/lms-platform.git
cd lms-platform

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Run Locally

```bash
# Terminal 1 - Start backend
cd server && npm run server

# Terminal 2 - Start frontend
cd client && npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📡 API Reference

### Courses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/course/all` | Get all courses | ❌ |
| `GET` | `/api/course/:id` | Get course by ID | ❌ |

### Educator (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/educator/update-role` | Upgrade user to educator |
| `POST` | `/api/educator/add-course` | Create new course |
| `GET` | `/api/educator/courses` | Get educator's courses |
| `GET` | `/api/educator/dashboard` | Get dashboard analytics |
| `GET` | `/api/educator/enrolled-students` | Get enrolled students |
| `PUT` | `/api/educator/course/:courseId` | Update course |
| `DELETE` | `/api/educator/course/:courseId` | Delete course |

### User (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/data` | Get user profile |
| `GET` | `/api/user/enrolled-courses` | Get enrolled courses |
| `POST` | `/api/user/purchase` | Initiate Stripe checkout |
| `POST` | `/api/user/update-course-progress` | Update progress |
| `POST` | `/api/user/get-course-progress` | Get course progress |
| `POST` | `/api/user/add-rating` | Rate a course |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/clerk` | Clerk webhook handler |
| `POST` | `/stripe` | Stripe webhook handler |

> *Thanks for visiting! If you liked this project, consider starring⭐ the repo.*

Built with ❤️ by **Kavita Mahato**
