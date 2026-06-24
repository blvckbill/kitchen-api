import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[${req.requestId}]`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorType,
      requestId: req.requestId,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: 'server_error',
    requestId: req.requestId,
  });
};