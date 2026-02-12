import { useEffect, useContext, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import axios from 'axios';
import Quill from 'quill';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Save } from 'lucide-react';
import uniqid from 'uniqid';
import { assets } from '../../assets/assets';

const EditCourse = () => {
    const { courseId } = useParams();
    const { getToken, backendUrl } = useContext(AppContext);

    const quillRef = useRef(null);
    const editorContainerRef = useRef(null);

    const [courseTitle, setCourseTitle] = useState('');
    const [chapters, setChapters] = useState([]);
    const [coursePrice, setCoursePrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [image, setImage] = useState(null);

    // States for lecture popup
    const [showPopup, setShowPopup] = useState(false);
    const [currentChapterId, setCurrentChapterId] = useState(null);
    const [lectureDetails, setLectureDetails] = useState({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
    });

    const [deleteModal, setDeleteModal] = useState({
        show: false,
        chapterId: null,
        lectureIndex: null,
    });
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const [deleteChapterModal, setDeleteChapterModal] = useState({
        show: false,
        chapterId: null,
    });
    const [deleteChapterConfirmText, setDeleteChapterConfirmText] =
        useState('');

    // Init Quill
    useEffect(() => {
        if (!quillRef.current && editorContainerRef.current) {
            quillRef.current = new Quill(editorContainerRef.current, {
                theme: 'snow',
                placeholder: 'Write course description...',
            });
        }
    }, []);

    // Fetch course
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get(
                    `${backendUrl}/api/course/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );

                if (data.success) {
                    const c = data.courseData;
                    setCourseTitle(c.courseTitle);
                    setChapters(c.courseContent || []);
                    setCoursePrice(c.coursePrice || 0);
                    setDiscount(c.discount || 0);

                    setTimeout(() => {
                        if (quillRef.current) {
                            quillRef.current.root.innerHTML =
                                c.courseDescription || '';
                        }
                    }, 0);
                }
            } catch (err) {
                toast.error('Failed to load course');
            }
        };

        fetchCourse();
    }, [courseId]);

    // Chapter edit
    const handleEditChapter = (chapterId) => {
        const title = prompt('New chapter name:');
        if (!title) return;

        setChapters((prev) =>
            prev.map((c) =>
                c.chapterId === chapterId ? { ...c, chapterTitle: title } : c,
            ),
        );
    };

    // Add Chapter
    const handleAddChapter = () => {
        const title = prompt('Enter Chapter Name:');
        if (title) {
            const newChapter = {
                chapterId: uniqid(),
                chapterTitle: title,
                chapterContent: [],
                collapsed: false,
                chapterOrder:
                    chapters.length > 0
                        ? chapters.slice(-1)[0].chapterOrder + 1
                        : 1,
            };
            setChapters([...chapters, newChapter]);
        }
    };

    // Lecture edit
    const handleEditLecture = (chapterId, index) => {
        const title = prompt('New lecture name:');
        if (!title) return;

        setChapters((prev) =>
            prev.map((c) => {
                if (c.chapterId !== chapterId) return c;

                const updatedLectures = [...c.chapterContent];
                updatedLectures[index] = {
                    ...updatedLectures[index],
                    lectureTitle: title,
                };

                return { ...c, chapterContent: updatedLectures };
            }),
        );
    };

    // Open popup to add lecture
    const handleAddLecture = (chapterId) => {
        setCurrentChapterId(chapterId);
        setShowPopup(true);
    };

    // Save the new lecture
    const addLecture = () => {
        setChapters(
            chapters.map((chapter) => {
                if (chapter.chapterId === currentChapterId) {
                    const newLecture = {
                        ...lectureDetails,
                        lectureOrder:
                            chapter.chapterContent.length > 0
                                ? chapter.chapterContent.slice(-1)[0]
                                      .lectureOrder + 1
                                : 1,
                        lectureId: uniqid(),
                    };
                    chapter.chapterContent.push(newLecture);
                }
                return chapter;
            }),
        );
        setShowPopup(false);
        setLectureDetails({
            lectureTitle: '',
            lectureDuration: '',
            lectureUrl: '',
            isPreviewFree: false,
        });
    };

    // Open delete chapter confirmation
    const handleDeleteChapter = (chapterId) => {
    setDeleteChapterModal({ show: true, chapterId });
    };

    // Confirm chapter deletion
    const confirmDeleteChapter = () => {
    if (deleteChapterConfirmText === 'Delete chapter') {
        setChapters(chapters.filter(ch => ch.chapterId !== deleteChapterModal.chapterId));
        setDeleteChapterModal({ show: false, chapterId: null });
        setDeleteChapterConfirmText('');
    } else {
        toast.error('Please type "Delete chapter" to confirm');
    }
    };

    const handleDeleteLecture = (chapterId, index) => {
        setDeleteModal({ show: true, chapterId, lectureIndex: index });
    };

    const confirmDelete = () => {
        if (deleteConfirmText !== 'Delete lecture') {
            toast.error('Type "Delete lecture" to confirm');
            return;
        }

        const { chapterId, lectureIndex } = deleteModal;

        setChapters((prev) =>
            prev.map((c) => {
                if (c.chapterId !== chapterId) return c;

                const updated = c.chapterContent.filter(
                    (_, i) => i !== lectureIndex,
                );

                return { ...c, chapterContent: updated };
            }),
        );

        setDeleteModal({ show: false, chapterId: null, lectureIndex: null });
        setDeleteConfirmText('');
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const courseData = {
                courseTitle,
                courseDescription: quillRef.current.root.innerHTML,
                coursePrice: Number(coursePrice),
                discount: Number(discount),
                courseContent: chapters,
            };

            const formData = new FormData();
            formData.append('courseData', JSON.stringify(courseData));
            if (image) formData.append('image', image);

            const token = await getToken();

            const { data } = await axios.put(
                `${backendUrl}/api/educator/course/${courseId}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } },
            );

            if (data.success) toast.success('Course updated!');
        } catch {
            toast.error('Save failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-slate-200"
                >
                    <h1 className="text-2xl font-semibold">Edit Course</h1>

                    <input
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="Course title"
                        className="w-full border rounded-xl p-3"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            value={coursePrice}
                            onChange={(e) => setCoursePrice(e.target.value)}
                            placeholder="Price"
                            className="border rounded-xl p-3"
                        />

                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="Discount %"
                            className="border rounded-xl p-3"
                        />
                    </div>

                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="border rounded-xl p-3"
                    />

                    <div className="border rounded-xl">
                        <div
                            ref={editorContainerRef}
                            className="min-h-[150px]"
                        />
                    </div>
                </motion.div>

                {/* Chapters */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Curriculum
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddChapter}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-s font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            + Add chapter
                        </button>
                    </div>

                    <div className="space-y-6">
                        {chapters.map((chapter) => (
                            <motion.div
                                key={chapter.chapterId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-base md:text-lg text-slate-900">
                                        {chapter.chapterTitle}
                                    </h3>
                                    <div className="flex items-center gap-3 pr-1 md:pr-3.5">
                                        <button
                                            type="button"
                                            onClick={() => handleAddLecture(chapter.chapterId)}
                                            className="border border-slate-300 rounded-full px-2 py-0.5 text-xs font-medium text-slate-700 hover:text-slate-900"
                                        >
                                            + Add lecture
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditChapter(chapter.chapterId)
                                            }
                                            className="flex gap-1.5 items-center text-xs md:text-sm text-slate-700 hover:text-slate-900"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteChapter(chapter.chapterId)
                                            }
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {chapter.chapterContent.map((lec, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center border rounded-xl p-3"
                                        >
                                            <div className="space-y-0.5 text-sm">
                                                <p className="font-medium text-slate-900">
                                                    {lec.lectureTitle}
                                                </p>
                                                {lec.lectureDuration && (
                                                    <p className="text-xs text-slate-500">
                                                        {lec.lectureDuration} mins
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditLecture(
                                                            chapter.chapterId,
                                                            i,
                                                        )
                                                    }
                                                    className="text-slate-700 hover:text-slate-900"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteLecture(
                                                            chapter.chapterId,
                                                            i,
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Save */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="w-full bg-slate-900 text-white p-4 rounded-2xl font-medium flex justify-center items-center gap-2 shadow-sm"
                >
                    <Save size={18} /> Save Changes
                </motion.button>

                {/* Delete lecture modal */}
                {deleteModal.show && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md">
                            <h3 className="font-semibold">
                                Confirm deletion by typing "Delete lecture"
                            </h3>

                            <input
                                value={deleteConfirmText}
                                onChange={(e) =>
                                    setDeleteConfirmText(e.target.value)
                                }
                                placeholder='Type "Delete lecture"'
                                className="border rounded-xl p-3 w-full"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-500 text-white rounded-xl p-3"
                                >
                                    Delete
                                </button>

                                <button
                                    onClick={() =>
                                        setDeleteModal({ show: false })
                                    }
                                    className="flex-1 border rounded-xl p-3"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete chapter modal */}
                {deleteChapterModal.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">
                                Delete Chapter
                            </h3>
                            <p className="text-gray-600 mb-2">
                                This will delete the chapter and{' '}
                                <strong>all its lectures</strong>.
                            </p>
                            <p className="text-gray-600 mb-4">
                                Type <strong>"Delete chapter"</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                className="w-full border rounded py-2 px-3 mb-4"
                                value={deleteChapterConfirmText}
                                onChange={(e) =>
                                    setDeleteChapterConfirmText(e.target.value)
                                }
                                placeholder="Delete chapter"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteChapterModal({
                                            show: false,
                                            chapterId: null,
                                        });
                                        setDeleteChapterConfirmText('');
                                    }}
                                    className="flex-1 py-2 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteChapter}
                                    className="flex-1 py-2 bg-red-500 text-white rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add lecture popup */}
                {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                            <h2 className="text-lg font-semibold mb-4 text-slate-900">
                                Add lecture
                            </h2>
                            <div className="mb-3 space-y-1">
                                <p className="text-sm text-slate-700">Lecture title</p>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    value={lectureDetails.lectureTitle}
                                    onChange={(e) =>
                                        setLectureDetails({
                                            ...lectureDetails,
                                            lectureTitle: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mb-3 space-y-1">
                                <p className="text-sm text-slate-700">
                                    Duration (minutes)
                                </p>
                                <input
                                    type="number"
                                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    value={lectureDetails.lectureDuration}
                                    onChange={(e) =>
                                        setLectureDetails({
                                            ...lectureDetails,
                                            lectureDuration: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mb-3 space-y-1">
                                <p className="text-sm text-slate-700">Lecture URL</p>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    value={lectureDetails.lectureUrl}
                                    onChange={(e) =>
                                        setLectureDetails({
                                            ...lectureDetails,
                                            lectureUrl: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300"
                                    checked={lectureDetails.isPreviewFree}
                                    onChange={(e) =>
                                        setLectureDetails({
                                            ...lectureDetails,
                                            isPreviewFree: e.target.checked,
                                        })
                                    }
                                />
                                <span>Mark as free preview</span>
                            </label>

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPopup(false);
                                        setLectureDetails({
                                            lectureTitle: '',
                                            lectureDuration: '',
                                            lectureUrl: '',
                                            isPreviewFree: false,
                                        });
                                    }}
                                    className="flex-1 rounded-xl border border-slate-300 py-2 text-sm font-medium text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={addLecture}
                                    className="flex-1 rounded-xl bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    Add lecture
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowPopup(false);
                                    setLectureDetails({
                                        lectureTitle: '',
                                        lectureDuration: '',
                                        lectureUrl: '',
                                        isPreviewFree: false,
                                    });
                                }}
                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                            >
                                <img
                                    src={assets.cross_icon}
                                    alt="close"
                                    className="h-4 w-4"
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditCourse;
