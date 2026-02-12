import { useContext, useEffect, useState } from 'react'
import AppContext from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyCourses = () => {

  const { isEducator, currency, backendUrl, getToken} = useContext(AppContext);
  const [courses, setCourses] = useState(null);

  // Fetch educator courses
  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(backendUrl + '/api/educator/courses',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      data.success && setCourses(data.courses);

    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator]);

  return courses ? (
    <div className="min-h-screen bg-slate-50 px-4 pt-8 pb-6 md:px-8">
      <div className='mx-auto w-full max-w-5xl space-y-4'>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">My courses</h2>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
          <table className="w-full table-fixed md:table-auto">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">Earnings</th>
                <th className="px-4 py-3 text-left">Students</th>
                <th className="px-4 py-3 text-left">Published</th>
                <th className="px-4 py-3 text-left w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {courses.map((course) => (
                <tr key={course._id} className="border-t border-slate-100">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.courseThumbnail}
                        alt="Course"
                        className="w-16 rounded-sm"
                      />
                      <span className="hidden md:block truncate font-medium text-slate-900">
                        {course.courseTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {currency}{' '}
                    {Math.floor(
                      course.enrolledStudents.length *
                      (course.coursePrice - (course.discount * course.coursePrice) / 100)
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {course.enrolledStudents.length}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Link
                      to={`/educator/edit-course/${course._id}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
};

export default MyCourses;