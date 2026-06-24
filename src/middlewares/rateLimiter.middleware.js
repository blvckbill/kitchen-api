import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redis.js';

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  message: {
    success: false,
    message,
    error: 'rate_limited',
  },
});

export const authRateLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many attempts, please try again after 15 minutes'
);

export const generalRateLimiter = createLimiter(
  60 * 1000,
  60,
  'Too many requests, please slow down'
);