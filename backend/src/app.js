import express from 'express';
import cors from 'cors';
import scrapingRoutes from './routes/scrapingRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/scraping', scrapingRoutes);
app.use('/api/jobs', jobRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler middleware
app.use(errorHandler);

export default app;
