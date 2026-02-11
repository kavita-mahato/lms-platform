import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js';

const courseRouter = express.Router()

// GET All Course
courseRouter.get('/all', getAllCourse)

// GET Course Data by ID
courseRouter.get('/:id', getCourseId)

export default courseRouter;