import express from 'express';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestId } from './middlewares/requestId.middleware.js';
import router from './routes/index.js';

const app = express();
// Set trust proxy to true if the app is behind a reverse proxy
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    requestId: req.requestId,
  });
});

app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'not_found',
    requestId: req.requestId,
  });
});

app.use(errorHandler);

export default app;