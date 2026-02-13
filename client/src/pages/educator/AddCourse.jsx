import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; 
import uniqid from 'uniqid';
import axios from 'axios';
import AppContext from '../../context/AppContext';

// --- Icons (Inline SVGs for zero-dependency) ---
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  ChevronDown: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
};

const steps = ['Basic Details', 'Thumbnail', 'Curriculum', 'Pricing', 'Publish'];

// InputField component
const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
    />
  </div>
);

// Reusable Modal Component
const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
      <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          ✕
        </button>
      </div>
      <div className="p-6">
         {children}
      </div>
    </div>
  </div>
);

const AddCourse = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, getToken } = useContext(AppContext);

  const [step, setStep] = useState(0);

  // Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);

  // Popups
  const [showLecturePopup, setShowLecturePopup] = useState(false);
  const [showChapterPopup, setShowChapterPopup] = useState(false);

  // Temporary State for edits
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  // ---------- Logic ----------

  const addChapter = () => {
    if (!newChapterTitle.trim()) return toast.error('Chapter title required');
    const newChapter = {
      chapterId: uniqid(),
      chapterTitle: newChapterTitle,
      chapterContent: [],
      collapsed: false,
      chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
    };
    setChapters([...chapters, newChapter]);
    setNewChapterTitle('');
    setShowChapterPopup(false);
  };

  const handleChapter = (action, chapterId) => {
    if (action === 'remove') {
      setChapters(chapters.filter(c => c.chapterId !== chapterId));
    }
    if (action === 'toggle') {
      setChapters(chapters.map(c => c.chapterId === chapterId ? { ...c, collapsed: !c.collapsed } : c));
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowLecturePopup(true);
    }
    if (action === 'remove') {
      setChapters(chapters.map(ch => {
        if (ch.chapterId === chapterId) {
          const updated = [...ch.chapterContent];
          updated.splice(lectureIndex, 1);
          return { ...ch, chapterContent: updated };
        }
        return ch;
      }));
    }
  };

  const addLecture = () => {
    if (!lectureDetails.lectureTitle.trim()) return toast.error('Lecture title required');
    setChapters(chapters.map(ch => {
      if (ch.chapterId === currentChapterId) {
        const newLecture = {
          ...lectureDetails,
          lectureId: uniqid(),
          lectureOrder: ch.chapterContent.length > 0 ? ch.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
        };
        return {
          ...ch,
          chapterContent: [...ch.chapterContent, newLecture],
        };
      }
      return ch;
    }));
    setLectureDetails({ lectureTitle: '', lectureDuration: '', lectureUrl: '', isPreviewFree: false });
    setShowLecturePopup(false);
  };

  const handleSubmit = async () => {
    try {
      if (!image) return toast.error('Thumbnail required');
      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };
      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        setCourseTitle('');
        setCoursePrice('');
        setDiscount('');
        setImage(null);
        setChapters([]);
        setStep(0);
        quillRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write a compelling description for your course...',
        modules: {
          toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]]
        }
      });
    }
  }, []);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // ---------- Render Helpers ----------

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <InputField 
              label="Course Title"
              value={courseTitle} 
              onChange={e => setCourseTitle(e.target.value)} 
              placeholder="e.g. Full Stack Development Bootcamp"
            />
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-gray-700">Description</label>
               <div className="bg-white rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <div ref={editorRef} className="min-h-62.5 border-none" />
               </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="animate-fadeIn">
             <label className="text-sm font-medium text-gray-700 mb-2 block">Course Thumbnail</label>
             <label className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${image ? 'border-blue-200 bg-blue-50/30' : 'border-gray-300'}`}>
              <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />
              {image ? (
                <div className="relative w-full h-full p-4">
                   <img src={URL.createObjectURL(image)} className="w-full h-full object-cover rounded-lg shadow-sm" alt="Preview" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white font-medium">Click to change</div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400 gap-3">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Icons.Upload />
                  </div>
                  <div className="text-center">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    <p className="text-xs mt-1 text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                  </div>
                </div>
              )}
            </label>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Course Content</h3>
              <button 
                onClick={() => setShowChapterPopup(true)} 
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
              >
                <Icons.Plus /> Add Chapter
              </button>
            </div>

            {chapters.length === 0 && (
               <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-500">
                  <p>No chapters added yet.</p>
               </div>
            )}

            <div className="space-y-3">
              {chapters.map((ch, i) => (
                <div key={ch.chapterId} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors"
                    onClick={() => handleChapter('toggle', ch.chapterId)}
                  >
                    <div className="flex items-center gap-3">
                        <span className={`transform transition-transform duration-300 text-gray-400 ${!ch.collapsed ? 'rotate-180' : ''}`}>
                          <Icons.ChevronDown className="w-5 h-5"/>
                        </span>
                        <span className="font-semibold text-gray-800 text-sm md:text-base">Chapter {i + 1}: <span className="font-medium text-gray-600">{ch.chapterTitle}</span></span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ch.chapterContent.length} Lectures</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleChapter('remove', ch.chapterId); }} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                      <Icons.Trash />
                    </button>
                  </div>

                  {!ch.collapsed && (
                    <div className="bg-gray-50/50 border-t border-gray-100 p-3 space-y-2">
                      {ch.chapterContent.map((lec, idx) => (
                        <div key={lec.lectureId} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm pl-4 ml-4 relative">
                          {/* Visual connector line */}
                          <div className="absolute left-[-16px] top-1/2 w-3 h-[1px] bg-gray-300"></div>
                          
                          <span className="text-sm text-gray-700 flex-1 truncate pr-4">
                            <span className="text-gray-400 mr-2">{idx + 1}.</span>
                            {lec.lectureTitle}
                          </span>
                          <button onClick={() => handleLecture('remove', ch.chapterId, idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <Icons.Trash />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => handleLecture('add', ch.chapterId)} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 ml-4 pl-2 py-1 transition-colors">
                        <Icons.Plus /> Add Lecture
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
            <InputField label="Course Price" type="number" value={coursePrice} onChange={e => setCoursePrice(e.target.value)} placeholder="0.00" />
            <InputField label="Discount %" type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" />
          </div>
        );

      case 4:
        return (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fadeIn space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Title</span>
                   <span className="font-medium text-gray-900">{courseTitle}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Thumbnail</span>
                   <span className="font-medium text-blue-600">{image ? 'Uploaded' : 'Missing'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Chapters</span>
                   <span className="font-medium text-gray-900">{chapters.length}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Price</span>
                   <span className="font-medium text-gray-900">${coursePrice}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500">Discount</span>
                   <span className="font-medium text-green-600">{discount}% Off</span>
                </div>
            </div>
            
            <button onClick={handleSubmit} className="w-full bg-black text-white h-12 rounded-lg font-medium text-lg shadow-lg hover:bg-gray-900 transform hover:-translate-y-0.5 transition-all mt-6">
               Publish Course
            </button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 md:p-10 font-sans text-gray-800">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100 flex flex-col gap-8">
        
        {/* Header */}
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Create Course</h1>
           <p className="text-gray-500 text-sm mt-1">Fill in the details to publish your new course.</p>
        </div>

        {/* Modern Stepper */}
        <div className="relative flex justify-between w-full mb-4">
           {/* Connecting Line */}
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2 rounded"></div>
           <div className="absolute top-1/2 left-0 h-0.5 bg-black -z-10 -translate-y-1/2 rounded transition-all duration-300" style={{ width: `${(step / (steps.length - 1)) * 100}%` }}></div>

           {steps.map((label, i) => (
             <div key={label} className="flex flex-col items-center gap-2 bg-white px-2">
               <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300 ${i <= step ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-200'}`}>
                 {i < step ? <Icons.Check /> : i + 1}
               </div>
               <span className={`text-xs font-medium uppercase tracking-wide hidden md:block transition-colors ${i <= step ? 'text-black' : 'text-gray-300'}`}>{label}</span>
             </div>
           ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
           {renderStep()}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <button onClick={back} disabled={step === 0} className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            Back
          </button>
          {step < steps.length - 1 && (
            <button onClick={next} className="px-8 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              Next <Icons.ChevronDown className="rotate-[-90deg] w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Popups */}
      {showChapterPopup && (
        <Modal onClose={() => setShowChapterPopup(false)} title="Add Chapter">
          <div className="space-y-4">
             <InputField value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} placeholder="e.g. Introduction to React" label="Chapter Title" />
             <button onClick={addChapter} className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">Add Chapter</button>
          </div>
        </Modal>
      )}

      {showLecturePopup && (
        <Modal onClose={() => setShowLecturePopup(false)} title="Add Lecture">
          <div className="space-y-4">
            <InputField label="Lecture Title" value={lectureDetails.lectureTitle} onChange={e => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} placeholder="e.g. Setting up the environment" />
            <InputField label="Duration (mins)" type="number" value={lectureDetails.lectureDuration} onChange={e => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })} placeholder="10" />
            <InputField label="Video URL" value={lectureDetails.lectureUrl} onChange={e => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })} placeholder="https://..." />
            
            <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="free-preview" checked={lectureDetails.isPreviewFree} onChange={e => setLectureDetails({...lectureDetails, isPreviewFree: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                <label htmlFor="free-preview" className="text-sm text-gray-600 cursor-pointer">Make this lecture a free preview</label>
            </div>

            <button onClick={addLecture} className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors mt-2">Add Lecture</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddCourse;
