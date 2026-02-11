import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    lectureId: { type: String, required: true },
    lectureOrder: { type: Number, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, default: false },
}, { _id: false});

const chapterSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
}, { _id: false });

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    discount: { type: Number, required: true, min: 0, max: 100 },
    courseContent: [chapterSchema],
    courseRatings: [
        {
            userId: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            review: { type: String }
        }
    ],
    educator: { type: String, required: true, ref: 'User' },
    enrolledStudents: [{ type: String, ref: 'User' }]
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;