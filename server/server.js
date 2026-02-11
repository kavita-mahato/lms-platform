import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebHooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

// Initialize Express app
const app = express();
const PORT = 5000;

// Connect to MongoDB
await connectDB();
await connectCloudinary();

// Middleware
app.use(cors());

// Stripe webhook MUST be before any body parser / auth middleware
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Clerk & JSON body parsing for the rest of the app
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the LMS Platform API');
});
app.post('/clerk', express.json(), clerkWebHooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

export default app;