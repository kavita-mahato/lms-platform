import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from 'axios';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const currency = import.meta.env.VITE_CURRENCY || '₹';
    const navigate = useNavigate();

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);

    // Fetch all Courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/course/all');
            if (data.success) {
                setAllCourses(data.courses);
            } else {
                toast.error(data.message || "Failed to fetch courses. Please try again.");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch UserData 
    const fetchUserData = async () => {
        try {
            if (user.publicMetadata.role === 'educator') {
                setIsEducator(true);
            }

            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch User Enrolled Courses
    const fetchEnrolledCourses = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Function to calculate average rating
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;
        let totalRating = 0;
        course.courseRatings.forEach((rating) => {
            totalRating += rating.rating;
        });
        return Math.floor(totalRating / course.courseRatings.length).toFixed(1);
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
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;

        course.courseContent.forEach((chapter) => {
            totalLectures += chapter.chapterContent.length;
        });

        return totalLectures;
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchEnrolledCourses(); // Executed when user changes
        }
    }, [user]);

    const value = {
        // Add context values here
        currency,
        allCourses,
        isEducator,
        enrolledCourses,
        backendUrl,
        userData,
        navigate,
        calculateRating,
        setIsEducator,
        calculateChapterTime,
        calculateTotalCourseDuration,
        calculateNoOfLectures,
        fetchEnrolledCourses,
        setUserData,
        getToken,
        fetchAllCourses
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContext;
