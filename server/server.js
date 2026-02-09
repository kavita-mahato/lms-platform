import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebHooks } from './controllers/webhooks.js';

// Initialize Express app
const app = express();
const PORT = 5000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the LMS Platform API');
});
app.post('/clerk', express.json(), clerkWebHooks);

// Start the server
/*
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); */

export default app;