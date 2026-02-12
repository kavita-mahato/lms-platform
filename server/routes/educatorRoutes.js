import express from 'express';
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateCourse, updateRoleToEducator } from '../controllers/educatorController.js';
import { protectEducator } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const educatorRouter = express.Router();

// Route to update user role to educator
educatorRouter.get('/update-role', updateRoleToEducator);

// POST: Route to add a new Course
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse);

// GET Educator Courses 
educatorRouter.get('/courses', protectEducator, getEducatorCourses);

// GET Educator Dashboard Data
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData);

// GET Enrolled Students Data
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData);

// PUT: Update Course
educatorRouter.put('/course/:courseId', upload.single('image'), protectEducator, updateCourse);

export default educatorRouter;