import { useContext } from 'react'
import { assets } from '../../assets/assets'
import AppContext from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({course}) => {

  const {currency, calculateRating} = useContext(AppContext);

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className='group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 md:p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
    >
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={course.courseThumbnail}
          alt="Thumbnail"
          className='w-full transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <div className='p-2 text-left space-y-1.5'>
        <h3 className='text-sm font-semibold text-slate-900 line-clamp-2'>{course.courseTitle}</h3>
        <p className='text-xs text-slate-500'>{course.educator?.name || 'Unknown Educator'}</p>
        {/* Rating & Reviews */}
        <div className='mt-1 flex items-center space-x-2'>
          <p className="text-xs font-medium text-slate-700">{calculateRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank}
                alt=""
                className='h-3.5 w-3.5'
              />
            ))}
          </div>
          <p className='text-xs text-slate-500'>({course.courseRatings.length})</p>
        </div>
        <p className='pt-1 text-sm font-semibold text-slate-900'>
          {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
        </p>
      </div>
    </Link>
  )
}

export default CourseCard;