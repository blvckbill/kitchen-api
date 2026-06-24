import express from 'express';
import { errorHandler } from './middlewares/error.middleware.js';
import router from './routes/index.js';

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'not_found',
  });
});

// Global error handler
app.use(errorHandler);

export default app;