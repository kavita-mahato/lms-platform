import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { assets } from '../../assets/assets'

const SearchBar = ({data}) => {

  const navigate = useNavigate();
  const [input, setInput] = useState(data ? data : " ");

  // To handle search
  const onSearchHandller = (e) => {
    e.preventDefault();
    navigate("/course-list/" + input);
  };

  return (
    <form onSubmit={onSearchHandller} className='max-w-xl w-full h-14 flex items-center bg-white rounded-lg shadow-md border border-gray-200 focus-within:ring-2 focus-within:ring-blue-200 transition'>
      <img src={assets.search_icon} alt="Search Icon" className='md:auto w-10 px-3'/>
      <input  onChange={e => setInput(e.target.value)}
      type="text" placeholder='Search courses...' className='w-full h-full outline-none text-gray-500/80'/>
      <button type='submit' className='bg-blue-600 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1 cursor-pointer'>Search</button>
    </form>
  )
}

export default SearchBar