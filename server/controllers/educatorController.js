import { clerkClient } from "@clerk/express";
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';

// Controller to update user role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator"
            }
        });
        res.status(200).json({ success: true, message: "You are now an Educator" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// API Controller function to add a new Course
export const addCourse = async (req, res) => {
    try {
        const courseData = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;
        
        if(!imageFile){
            return res.status(500).json({ success: false, message: 'Course thumbnail is required' });
        }
        const parsedCourseData = await JSON.parse(courseData.courseData);
        parsedCourseData.educator = educatorId;
        const newCourse = await Course.create(parsedCourseData);
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({ success: true, message: 'Course created successfully', newCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}