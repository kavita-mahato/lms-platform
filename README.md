# LMS Platform

A full-stack Learning Management System built with React and Express.js, featuring course management, video playback, payment processing, and separate interfaces for students and educators.

## Features

### Student Portal
- Browse and search courses
- View detailed course information
- Enroll in courses via Stripe payments
- Track course progress
- Video player for course content

### Educator Portal
- Dashboard with analytics
- Create and manage courses
- Edit existing courses
- View enrolled students

## Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **React Router** for navigation
- **Clerk** for authentication
- **Framer Motion** for animations
- **Quill** for rich text editing
- **React YouTube** for video playback

### Backend
- **Express.js 5**
- **MongoDB** with Mongoose ODM
- **Clerk** for authentication
- **Stripe** for payment processing
- **Cloudinary** for media storage
- **Multer** for file uploads

## Project Structure

```
lms-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── student/    # Student-facing pages
│   │   │   └── educator/   # Educator-facing pages
│   │   ├── context/        # React context providers
│   │   └── assets/         # Static assets
│   └── public/
├── server/                 # Express backend
│   ├── configs/            # Database & service configs
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Custom middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   └── server.js           # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Clerk account
- Stripe account
- Cloudinary account

### Environment Variables

**Client (`client/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:5000
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

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms-platform
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

**Start the backend server:**
```bash
cd server
npm run server
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/course` | Get all courses |
| GET | `/api/course/:id` | Get course by ID |
| POST | `/api/educator/add-course` | Create a new course |
| PUT | `/api/educator/update-course` | Update a course |
| GET | `/api/user/enrolled-courses` | Get user's enrolled courses |
| POST | `/clerk` | Clerk webhook handler |
| POST | `/stripe` | Stripe webhook handler |



> *Thanks for visiting! If you liked this project, consider starring the repo.* ⭐

Built with ❤️ by **Kavita Mahato**
