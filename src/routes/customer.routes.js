import { Router } from 'express';
import { requireCustomer } from '../middlewares/auth.middleware.js';
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

// Auth — public
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);


// protected
router.get('/vendors', requireCustomer, listVendors);
router.get('/vendors/:id', requireCustomer, getVendor);
router.get('/vendors/:id/menu', requireCustomer, listVendorMenuItems);
router.get('/vendors/:id/menu/:itemId', requireCustomer, getMenuItem);
router.post('/auth/logout', requireCustomer, logout);

export default router;