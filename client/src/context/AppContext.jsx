import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyCourses } from '../assets/assets';
import humanizeDuration from 'humanize-duration';

const AppContext = createContext();

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY || '₹';
    const navigate = useNavigate();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    // Fetch all Courses
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    };

    // Function to calculate average rating
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;
        let totalRating = 0;
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        });
        return (totalRating / course.courseRatings.length).toFixed(1);
    };

    // Function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => {
            time += lecture.lectureDuration;
        });
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    // Function to calculate total course duration
    const calculateTotalCourseDuration = (course) => {
        let totalTime = 0;
        course.courseContent.map((chapter) => {
            chapter.chapterContent.map((lecture) => {
                totalTime += lecture.lectureDuration;
            });
        });
        return humanizeDuration(totalTime * 60 * 1000, { units: ['h', 'm'] });
    };

    // Function to calculate total number of lectures in a course
    const calculateTotalLectures = (course) => {
        let totalLectures = 0;

        course.courseContent.forEach((chapter) => {
            totalLectures += chapter.chapterContent.length;
        });

        return totalLectures;
    };

    // Fetch user Enrolled Courses
    const fetchEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses);
    }

    useEffect(() => {
        fetchAllCourses();
        fetchEnrolledCourses();
    }, []);

    const value = {
        // Add context values here
        currency,
        allCourses,
        isEducator,
        enrolledCourses,
        navigate,
        calculateRating,
        setIsEducator,
        calculateChapterTime,
        calculateTotalCourseDuration,
        calculateTotalLectures,
        fetchEnrolledCourses,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContext;
