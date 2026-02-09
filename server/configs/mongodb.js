import mongoose from 'mongoose';

// Connect to MongoDB database
const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));
    await mongoose.connect(process.env.MONGODB_URI);
}

export default connectDB;