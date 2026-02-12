import { useContext } from 'react'
import AppContext from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const SideBar = () => {

  const { isEducator } = useContext(AppContext);

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon },
  ];

  return isEducator && (
    <aside className='md:w-64 w-16 border-r border-slate-200 bg-slate-50/80 min-h-screen text-sm py-4 flex flex-col'>
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/educator'} // Dashboard link
          className={({ isActive }) =>
            `flex items-center md:flex-row flex-col md:justify-start justify-center py-3 md:px-8 gap-3 transition-all ${
              isActive
                ? 'bg-white text-slate-900 border-r-[3px] border-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-r-[3px] border-transparent'
            }`
          }
        >
          <img src={item.icon} alt="" className="w-5 h-5" />
          <p className='md:block hidden text-center truncate'>{item.name}</p>
        </NavLink>
      ))}
    </aside>
  )
}

export default SideBar;