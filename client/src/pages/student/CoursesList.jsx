import { useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom';

import AppContext from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';

const CoursesList = () => {
  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams();
  
  const filteredCourses = useMemo(() => {
    if (!allCourses || allCourses.length === 0) return [];

    const tempCourses = allCourses.slice();
    const term = input?.trim();

    if (!term) return tempCourses;

    return tempCourses.filter(item =>
      item.courseTitle.toLowerCase().includes(term.toLowerCase())
    );
  }, [allCourses, input]);

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
          {/* Left side: Heading and Breadcrumb */}
          <div>
            <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
            <p className='text-gray-500'>
              <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/')}>Home</span> / <span>Course List</span>
            </p>
          </div>
          {/* Right side: Search Bar */}
          <SearchBar data={input}/>
        </div>
        {
          input && input.trim() && <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600'>
            <p>{input}</p>
            <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={() => navigate('/course-list')}/>
          </div>
        }
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0'>
          {filteredCourses.map((course, index) => ( <CourseCard key={index} course={course} index={index}/> ))}
        </div>
      </div>
    </>
  )
}

export default CoursesList