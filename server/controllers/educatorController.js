import { clerkClient } from "@clerk/express";
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

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
            return res.status(400).json({ success: false, message: 'Course thumbnail is required' });
        }
        const parsedCourseData = await JSON.parse(courseData.courseData);
        parsedCourseData.educator = educatorId;
        const newCourse = await Course.create(parsedCourseData);
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.status(200).json({ success: true, message: 'Course created successfully'});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get all courses for an educator
export const getEducatorCourses = async (req, res) => {
    try {
        const educatorId = req.auth.userId;
        const courses = await Course.find({ educator: educatorId });
        res.status(200).json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }
        res.status(200).json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // Enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));
        res.status(200).json({success: true, enrolledStudents});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};