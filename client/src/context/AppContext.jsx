import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyCourses } from "../assets/assets";

const AppContext = createContext();

export const AppContextProvider = (props) => {

  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);

  // Fetch all Courses
  const fetchAllCourses = async() => {
      setAllCourses(dummyCourses);
  }

  // Function to calculate average rating
  const calculateRating = (course) => {
      if (course.courseRatings.length === 0) return 0;
      let totalRating = 0;
      course.courseRatings.forEach(rating => {
          totalRating += rating.rating;
      });
      return (totalRating / course.courseRatings.length).toFixed(1);
  }

  useEffect(() => {
      fetchAllCourses();
  }, []);

  const value = {
      // Add context values here
      currency,
      allCourses,
      navigate,
      calculateRating,
      isEducator,
      setIsEducator
  };
    
  return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
  );
};

export default AppContext;