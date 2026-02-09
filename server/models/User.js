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
        password: {type: String, required: true},
        role: {type: String, enum: ['student', 'instructor'], required: true},
    }, {timestamps: true}
);

const User = mongoose.model('User', userSchema);

export default User;