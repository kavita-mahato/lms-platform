import { useContext, useState } from 'react'
import AppContext from '../../context/AppContext';
import {Line} from 'rc-progress';
import Footer from '../../components/student/Footer';

const MyEnrollments = () => {

  const {enrolledCourses, calculateTotalCourseDuration, navigate} = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([
    { courseId: 'course1', completedLectures: 4, totalLectures: 10 },
    { courseId: 'course2', completedLectures: 8, totalLectures: 8 },
    { courseId: 'course3', completedLectures: 6, totalLectures: 12 },
    { courseId: 'course4', completedLectures: 1, totalLectures: 5 },
  ]); // Dummy progress data for demo
  
  return (
    <>
      <div className='md:px-36 px-8 pt-10'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>
        <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
          <thead className='text-gray-900 border border-gray-500/20 text-sm text-left max-sm:hidden'>
            <tr>
              <th className='px-4 py-3 font-semibold truncate'>Course</th>
              <th className='px-4 py-3 font-semibold truncate'>Duration</th>
              <th className='px-4 py-3 font-semibold truncate'>Completed</th>
              <th className='px-4 py-3 font-semibold truncate'>Status</th>
            </tr>
          </thead>
          <tbody className='text-gray-700'>
            {enrolledCourses.map((course, index) => (
              <tr key={index} className='border border-gray-500/20'>
                <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                  <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 md:w-28'/>
                  <div className='flex-1'>
                    <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                    <Line percent={progressArray[index] ? (progressArray[index].completedLectures / progressArray[index].totalLectures) * 100 : 0} strokeWidth={1} strokeColor="#3b82f6" className='mt-1'/>
                  </div>
                </td>
                <td className='px-4 py-3 max-sm:hidden'>
                  {calculateTotalCourseDuration(course)}
                </td>
                <td className='px-4 py-3 max-sm:hidden'>
                  {progressArray[index] && `${progressArray[index].completedLectures}/${progressArray[index].totalLectures}`} <span>Lectures</span>
                </td>
                <td className='px-4 py-3 max-sm:text-right'>
                  <button className='bg-blue-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer' onClick={() => navigate('/player/' + course._id)}>
                    {progressArray[index] ? (progressArray[index].completedLectures === progressArray[index].totalLectures ? 'Completed' : 'On going') : 'On going'}
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer/>
    </>
  )
}

export default MyEnrollments;