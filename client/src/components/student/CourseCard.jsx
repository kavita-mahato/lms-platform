import { useContext } from 'react'
import { assets } from '../../assets/assets'
import AppContext from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({course}) => {

  const {currency} = useContext(AppContext);

  return (
    <Link to={`/course/${course._id}`} onClick={() => scrollTo(0, 0,)} className='border border-gray-300 rounded-lg p-4 md:p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 overflow-hidden'>
      <img src={course.courseThumbnail} alt="Thumbnail" className='w-full'/>
      <div className='p-3 text-left'>
        <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
        <p className='text-gray-500'>{course.educator.name}</p>
        <div className='flex items-center space-x-2'>
          <p>4.5</p>
          <div className='flex'>
            {[...Array(5)].map((_, index) => (
              <img key={index} src={assets.star} alt="" className='w-3.5 h-3.5'/>
            ))}
          </div>
          <p className='text-gray-500'>(1200 reviews)</p>
        </div>
        <p className='text-base font-semibold text-gray-800'>{currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCard