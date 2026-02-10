import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
        _id: {type: String, required: true},
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        imageUrl: {type: String},
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        role: {type: String, enum: ['student', 'instructor'], default: 'student'},
    }, {timestamps: true}
);

const User = mongoose.model('User', userSchema);

export default User;