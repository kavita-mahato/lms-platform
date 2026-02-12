import { useEffect, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../../context/AppContext";
import axios from "axios";
import Quill from "quill";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Save, Plus } from "lucide-react";
import uniqid from "uniqid";
import { assets } from "../../assets/assets";

const cardAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const EditCourse = () => {
  const { courseId } = useParams();
  const { getToken, backendUrl } = useContext(AppContext);

  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [chapters, setChapters] = useState([]);
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    chapterId: null,
    lectureIndex: null,
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [deleteChapterModal, setDeleteChapterModal] = useState({
    show: false,
    chapterId: null,
  });
  const [deleteChapterConfirmText, setDeleteChapterConfirmText] =
    useState("");

  useEffect(() => {
    if (!quillRef.current && editorContainerRef.current) {
      quillRef.current = new Quill(editorContainerRef.current, {
        theme: "snow",
        placeholder: "Write a beautiful course description…",
      });
    }
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(
          `${backendUrl}/api/course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
                c.courseDescription || "";
            }
          }, 0);
        }
      } catch {
        toast.error("Failed to load course");
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleAddChapter = () => {
    const title = prompt("Enter chapter name:");
    if (!title) return;

    const newChapter = {
      chapterId: uniqid(),
      chapterTitle: title,
      chapterContent: [],
      chapterOrder:
        chapters.length > 0
          ? chapters.slice(-1)[0].chapterOrder + 1
          : 1,
    };

    setChapters([...chapters, newChapter]);
  };

  const handleEditChapter = (chapterId) => {
    const title = prompt("New chapter name:");
    if (!title) return;

    setChapters((prev) =>
      prev.map((c) =>
        c.chapterId === chapterId ? { ...c, chapterTitle: title } : c
      )
    );
  };

  const handleAddLecture = (chapterId) => {
    setCurrentChapterId(chapterId);
    setShowPopup(true);
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );

    setShowPopup(false);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
  };

  const handleDeleteLecture = (chapterId, index) => {
    setDeleteModal({ show: true, chapterId, lectureIndex: index });
  };

  const confirmDelete = () => {
    if (deleteConfirmText !== "Delete lecture") {
      toast.error('Type "Delete lecture" to confirm');
      return;
    }

    const { chapterId, lectureIndex } = deleteModal;

    setChapters((prev) =>
      prev.map((c) => {
        if (c.chapterId !== chapterId) return c;
        return {
          ...c,
          chapterContent: c.chapterContent.filter(
            (_, i) => i !== lectureIndex
          ),
        };
      })
    );

    setDeleteModal({ show: false, chapterId: null, lectureIndex: null });
    setDeleteConfirmText("");
  };

  const handleDeleteChapter = (chapterId) => {
    setDeleteChapterModal({ show: true, chapterId });
  };

  const confirmDeleteChapter = () => {
    if (deleteChapterConfirmText !== "Delete chapter") {
      toast.error('Please type "Delete chapter"');
      return;
    }

    setChapters((prev) =>
      prev.filter((c) => c.chapterId !== deleteChapterModal.chapterId)
    );

    setDeleteChapterModal({ show: false, chapterId: null });
    setDeleteChapterConfirmText("");
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
      formData.append("courseData", JSON.stringify(courseData));
      if (image) formData.append("image", image);

      const token = await getToken();

      const { data } = await axios.put(
        `${backendUrl}/api/educator/course/${courseId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) toast.success("Course updated!");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Card */}
        <motion.div
          {...cardAnim}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Edit Course
            </h1>
            <p className="text-sm text-slate-500">
              Update details, pricing, and curriculum.
            </p>
          </div>

          <input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Course title"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              placeholder="Price"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />

            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Discount %"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />

            <label className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50">
              Upload image
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div ref={editorContainerRef} className="min-h-[180px]" />
          </div>
        </motion.div>

        {/* Curriculum */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Curriculum
            </h2>
            <button
              onClick={handleAddChapter}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <Plus size={16} /> Add chapter
            </button>
          </div>

          <AnimatePresence>
            {chapters.map((chapter) => (
              <motion.div
                key={chapter.chapterId}
                {...cardAnim}
                layout
                className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-medium text-slate-900">
                    {chapter.chapterTitle}
                  </h3>

                  <div className="flex items-center gap-3 text-sm">
                    <button
                      onClick={() => handleAddLecture(chapter.chapterId)}
                      className="px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50"
                    >
                      + Lecture
                    </button>

                    <button
                      onClick={() => handleEditChapter(chapter.chapterId)}
                      className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteChapter(chapter.chapterId)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {chapter.chapterContent.map((lec, i) => (
                    <motion.div
                      key={lec.lectureId}
                      layout
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="text-sm">
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
                          onClick={() =>
                            handleDeleteLecture(chapter.chapterId, i)
                          }
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full rounded-3xl bg-slate-900 text-white py-4 font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-slate-800"
        >
          <Save size={18} /> Save Changes
        </motion.button>

        {/* Delete Lecture Modal */}
        {deleteModal.show && (
          <Modal
            title="Delete lecture"
            confirmText="Delete lecture"
            input={deleteConfirmText}
            setInput={setDeleteConfirmText}
            onCancel={() => setDeleteModal({ show: false })}
            onConfirm={confirmDelete}
          />
        )}

        {/* Delete Chapter Modal */}
        {deleteChapterModal.show && (
          <Modal
            title="Delete chapter"
            confirmText="Delete chapter"
            input={deleteChapterConfirmText}
            setInput={setDeleteChapterConfirmText}
            onCancel={() => setDeleteChapterModal({ show: false })}
            onConfirm={confirmDeleteChapter}
          />
        )}

        {/* Lecture Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl space-y-4"
            >
              <h2 className="font-semibold text-slate-900">
                Add lecture
              </h2>

              {[
                ["Lecture title", "lectureTitle"],
                ["Duration (minutes)", "lectureDuration"],
                ["Lecture URL", "lectureUrl"],
              ].map(([label, key]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs text-slate-500">{label}</p>
                  <input
                    value={lectureDetails[key]}
                    onChange={(e) =>
                      setLectureDetails({
                        ...lectureDetails,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) =>
                    setLectureDetails({
                      ...lectureDetails,
                      isPreviewFree: e.target.checked,
                    })
                  }
                />
                Free preview
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 border border-slate-300 rounded-xl py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={addLecture}
                  className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-sm"
                >
                  Add
                </button>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <img src={assets.cross_icon} alt="close" className="h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ title, confirmText, input, setInput, onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-xl"
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">
        Type <strong>{confirmText}</strong> to confirm.
      </p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={confirmText}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
      />

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 border border-slate-300 rounded-xl py-2 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

export default EditCourse;
