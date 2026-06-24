import { ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: 'validation_error',
        errors: messages,
      });
    }
    next(error);
  }
};