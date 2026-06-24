import { Router } from 'express';
import { requireCustomer } from '../middlewares/auth.middleware.js';
import { authRateLimiter, generalRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  register,
  login,
  refresh,
  logout,
} from '../controllers/customer.controller.js';
import {
  listVendors,
  getVendor,
  listVendorMenuItems,
  getMenuItem,
} from '../controllers/menu.controller.js';

const router = Router();

// Auth — rate limiter
router.post('/auth/register', authRateLimiter, register);
router.post('/auth/login', authRateLimiter, login);
router.post('/auth/refresh', authRateLimiter, refresh);
router.post('/auth/logout', requireCustomer, logout);

// Browsing — rate limiter
router.get('/vendors', generalRateLimiter, requireCustomer, listVendors);
router.get('/vendors/:id', generalRateLimiter, requireCustomer, getVendor);
router.get('/vendors/:id/menu', generalRateLimiter, requireCustomer, listVendorMenuItems);
router.get('/vendors/:id/menu/:itemId', generalRateLimiter, requireCustomer, getMenuItem);

export default router;