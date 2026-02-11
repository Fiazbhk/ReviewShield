import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { startReviewPoller } from './cron/reviewPoller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('ReviewShield API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the background cron job for fetching reviews
  startReviewPoller();
});