import React from 'react';
import {assets, dummyEducatorData} from '../../assets/assets';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const educatordata = dummyEducatorData;
  const { user } = useUser();

  return (
    <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link to='/'>
          <img src={assets.logo} alt="logo" className='w-24 lg:w-28' />
        </Link>

        <div className='flex items-center gap-4 text-sm text-slate-600'>
          <p className="hidden sm:block">
            Hi, <span className="font-medium text-slate-900">{user ? user.fullName : 'Educator'}</span>
          </p>
          {user ? (
            <UserButton />
          ) : (
            <img
              className='h-9 w-9 rounded-full border border-slate-200 object-cover'
              src={assets.profile_img}
              alt="profile"
            />
          )}
        </div>
      </div>
    </header>
  )
}

export default NavBar;