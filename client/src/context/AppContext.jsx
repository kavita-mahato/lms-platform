import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";

const AppContext = createContext();

export const AppContextProvider = (props) => {

  const currency = import.meta.env.VITE_CURRENCY || '$';
  const [allCourses, setAllCourses] = useState([]);

  // Fetch all Courses
  const fetchAllCourses = async() => {
      setAllCourses(dummyCourses);
  }

  useEffect(() => {
      fetchAllCourses();
  }, []);

  const value = {
      // Add context values here
      currency,
      allCourses,
  };
    
  return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
  );
};

export default AppContext;