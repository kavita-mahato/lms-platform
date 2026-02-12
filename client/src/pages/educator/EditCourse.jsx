import { useEffect, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../../context/AppContext";
import axios from "axios";
import Quill from "quill";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Pencil, Trash2, Save } from "lucide-react";

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

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    chapterId: null,
    lectureIndex: null,
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Init Quill
  useEffect(() => {
    if (!quillRef.current && editorContainerRef.current) {
      quillRef.current = new Quill(editorContainerRef.current, {
        theme: "snow",
        placeholder: "Write course description...",
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
              quillRef.current.root.innerHTML = c.courseDescription || "";
            }
          }, 0);
        }
      } catch (err) {
        toast.error("Failed to load course");
      }
    };

    fetchCourse();
  }, [courseId]);

  // Chapter edit
  const handleEditChapter = (chapterId) => {
    const title = prompt("New chapter name:");
    if (!title) return;

    setChapters((prev) =>
      prev.map((c) =>
        c.chapterId === chapterId
          ? { ...c, chapterTitle: title }
          : c
      )
    );
  };

  // Lecture edit
  const handleEditLecture = (chapterId, index) => {
    const title = prompt("New lecture name:");
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
      })
    );
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

        const updated = c.chapterContent.filter(
          (_, i) => i !== lectureIndex
        );

        return { ...c, chapterContent: updated };
      })
    );

    setDeleteModal({ show: false, chapterId: null, lectureIndex: null });
    setDeleteConfirmText("");
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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
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
          <div ref={editorContainerRef} className="min-h-[150px]" />
        </div>
      </motion.div>

      {/* Chapters */}
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <motion.div
            key={chapter.chapterId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">
                {chapter.chapterTitle}
              </h2>

              <button
                onClick={() => handleEditChapter(chapter.chapterId)}
                className="flex gap-2 items-center text-sm"
              >
                <Pencil size={16} /> Edit
              </button>
            </div>

            <div className="space-y-3">
              {chapter.chapterContent.map((lec, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border rounded-xl p-3"
                >
                  <span>{lec.lectureTitle}</span>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleEditLecture(chapter.chapterId, i)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteLecture(chapter.chapterId, i)
                      }
                      className="text-red-500"
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

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        className="w-full bg-blue-600 text-white p-4 rounded-2xl font-medium flex justify-center items-center gap-2"
      >
        <Save size={18} /> Save Changes
      </motion.button>

      {/* Delete modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md">
            <h3 className="font-semibold">Confirm deletion</h3>

            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
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
                onClick={() => setDeleteModal({ show: false })}
                className="flex-1 border rounded-xl p-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCourse;