import Course from "../models/Course.js";

// Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator', select: '-password' });

        res.status(200).json({ success: true, courses });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Course by Id
export const getCourseId = async (req, res) => {
    const { id } = req.params;
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' });

        if (!courseData) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if user is authenticated and enrolled
        const userId = req.auth?.userId;
        const isEnrolled = userId && courseData.enrolledStudents.includes(userId);

        // If NOT enrolled, only show the first lecture as preview
        if (!isEnrolled) {
            let isFirstLecture = true;
            courseData.courseContent.forEach(chapter => {
                chapter.chapterContent.forEach(lecture => {
                    if (isFirstLecture) {
                        isFirstLecture = false; // First lecture keeps its URL
                    } else {
                        lecture.lectureUrl = ""; // Hide URL for all other lectures
                    }
                });
            });
        }

        res.status(200).json({ success: true, courseData });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
