import { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import AppContext from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {

  const { isEducator, currency, getToken, backendUrl } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  console.log(dashboardData);
  console.log(setDashboardData);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(backendUrl + '/api/educator/dashboard',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    console.log("isEducator:", isEducator);
    if (isEducator) {
      fetchDashboardData();
    }
  }, [isEducator]);

  const studentsData = [
    {
      id: 1,
      name: 'Richard Sanford',
      profileImage: assets.profile_img,
      courseTitle: 'Build Text to Image SaaS App in React JS',
      date: '22 Aug, 2024'
    },
    {
      id: 2,
      name: 'Enrique Murphy',
      profileImage: assets.profile_img2,
      courseTitle: 'Build Text to Image SaaS App in React JS',
      date: '22 Aug, 2024'
    },
    {
      id: 3,
      name: 'Alison Powell',
      profileImage: assets.profile_img3,
      courseTitle: 'Build Text to Image SaaS App in React JS',
      date: '22 Aug, 2024'
    },
    {
      id: 4,
      name: 'Richard Sanford',
      profileImage: assets.profile_img,
      courseTitle: 'Build Text to Image SaaS App in React JS',
      date: '22 Aug, 2024'
    },
    {
      id: 5,
      name: 'Enrique Murphy',
      profileImage: assets.profile_img2,
      courseTitle: 'Build Text to Image SaaS App in React JS',
      date: '22 Aug, 2024'
    },
    {
      id: 6,
      name: 'Alison Powell',
      profileImage: assets.profile_img3,
      courseTitle: 'Build Text to Image SaaS App in React JS',
      date: '22 Aug, 2024'
    }
  ];


  return dashboardData ? (
    <div className='min-h-screen bg-slate-50 px-4 pt-8 pb-6 md:px-8'>
      <div className='mx-auto flex max-w-5xl flex-col gap-8'>
        {/* Stats */}
        <div className='grid gap-4 sm:grid-cols-3'>
          <div className='flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200'>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/5">
              <img src={assets.patients_icon} alt="enrolments_icon" className="h-5 w-5" />
            </div>
            <div>
              <p className='text-2xl font-semibold text-slate-900'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-xs font-medium text-slate-500 tracking-wide uppercase'>Total enrolments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200'>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/5">
              <img src={assets.appointments_icon} alt="courses_icon" className="h-5 w-5" />
            </div>
            <div>
              <p className='text-2xl font-semibold text-slate-900'>{dashboardData.totalCourses}</p>
              <p className='text-xs font-medium text-slate-500 tracking-wide uppercase'>Total courses</p>
            </div>
          </div>
          <div className='flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200'>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/5">
              <img src={assets.earning_icon} alt="earnings_icon" className="h-5 w-5" />
            </div>
            <div>
              <p className='text-2xl font-semibold text-slate-900'>{currency}{Math.floor(dashboardData.totalEarnings)}</p>
              <p className='text-xs font-medium text-slate-500 tracking-wide uppercase'>Total earnings</p>
            </div>
          </div>
        </div>

        {/* Latest enrolments */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Latest enrolments</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full table-fixed md:table-auto">
              <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Course</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-center align-middle hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="md:px-4 px-2 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.student.imageUrl}
                          alt="Profile"
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <span className="truncate font-medium text-slate-900">
                          {item.student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="truncate text-slate-600">{item.courseTitle}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard;