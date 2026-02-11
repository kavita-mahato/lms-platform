import express from 'express';
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js';

const userRouter = express.Router();

// GET user Data
userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);

// POST Requests for User Actions
userRouter.post('/purchase', purchaseCourse);

export default userRouter;