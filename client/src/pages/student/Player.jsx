import { useContext, useEffect, useState } from 'react';
import AppContext from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';

const Player = () => {

  const {enrolledCourses, calculateChapterTime} = useContext(AppContext);
  const {courseId} = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const getCourseData = () => {
    const found = enrolledCourses.find(c => c._id === courseId);
    setCourseData(found || null);
  };

  // Function to toggle chapter sections
  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Function to extract YouTube video ID from URL
  const getYoutubeId = (url) => {
    const regExp =
      /(?:youtube\.com.*v=|youtu\.be\/)([^?&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  useEffect(() => {
    getCourseData();
  }, [courseId, enrolledCourses]);

  return (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        {/* left column */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className='pt-5'>
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white rounded mb-2'>
                <div className='flex items-center justify-between px-4 py-3 cursor-pinter select-none' onClick={() => toggleSection(index)}>
                  <div className='flex items-center gap-2 cursor-pointer'>
                    <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}/>
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                  <ul className='list-disc md:pl-10 pl-4 py-2 pr-4 text-gray-600 border-t border-gray-300'>
                      {chapter.chapterContent.map((lecture, lecIndex) => (
                        <li key={lecIndex} className='flex items-start gap-2 py-1 cursor-pointer hover:text-gray-800'>
                          <img src={false ? assets.blue_tick_icon : assets.play_icon} alt="play icon" className="inline mt-1 w-4 h-4" />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.lectureUrl && <p 
                              onClick={() => setPlayerData({
                                ...lecture,chapter: index + 1, lecture: lecIndex + 1, youtubeId: getYoutubeId(lecture.lectureUrl)
                              })}
                              className='text-blue-500 cursor-pointer'>Watch</p>}
                              <p className='text-xs'>( {humanizeDuration(lecture.lectureDuration * 60 * 1000, {units: ['h', 'm']})} )</p>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this course</h1>
            <Rating initialRating={courseData?.courseRating || 0} onRate={(rating) => {
              setCourseData({...courseData, courseRating: rating});
            }}/>
          </div>
        </div>

        {/* right column */}
        <div className='md:mt-10'>
          {playerData ? (
            <div>
              <YouTube videoId={playerData.youtubeId} opts={{playerVars: {autoplay: 1}}} iframeClassName="w-full aspect-video" />
              <div className='flex justify-between items-center mt-1'>
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                <button className='text-blue-600'>{false? 'Completed': 'Mark Complete'}</button>
              </div>
            </div>
          )
          : courseData?.courseThumbnail && (
            <img src={courseData.courseThumbnail} alt="Course thumbnail" />
          )}
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default Player;