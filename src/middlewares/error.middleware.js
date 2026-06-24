import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.errorType);
  }

  // Unexpected errors
  return errorResponse(res, 'Something went wrong', 500, 'server_error');
};