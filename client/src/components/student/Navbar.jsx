import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import AppContext from '../../context/AppContext';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {

  const { navigate, isEducator, backendUrl, setIsEducator, getToken } = useContext(AppContext);

  const isCourseListPage = location.pathname.includes('/course-list');
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const becomeEducator = async () => {
    try {
      if(isEducator){
        navigate('/educator');
        return;
      }
      const token = await getToken();
      const {data} = await axios.get(backendUrl + "/api/educator/update-role", {headers: {Authorization: `Bearer ${token}`}});
      if (data.success){
        setIsEducator(true);
        toast.success(data.message);
      }else {
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className={`w-full flex items-center justify-between px-4 py-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt='Logo' className='w-28 lg:w-32 cursor-pointer'/>
      <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex items-center gap-5'>
          { user && <>
            <button onClick={becomeEducator} className='cursor-pointer'>{ isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
          | <Link to='/my-enrollments'>My Enrollments</Link>
          </>
          }
        </div>
        { user ? <UserButton/> :
          <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer'>Log In</button>}
      </div>
        {/* Mobile view */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          { user && <>
            <button onClick={becomeEducator}>{ isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
          | <Link to='/my-enrollments'>My Enrollments</Link>
          </>
          }
        </div>
        { user ? <UserButton/> : <button onClick={() => openSignIn()}><img src={assets.user_icon} alt='User Icon' className='w-6 h-6 cursor-pointer'/></button>}
      </div>
    </div>
  )
}

export default Navbar