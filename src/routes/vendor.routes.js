import { Router } from 'express';
import { requireVendor } from '../middlewares/requireVendor.js';
import { generalRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/vendor.controller.js';

const router = Router();

router.use(generalRateLimiter);
router.use(requireVendor);

router.get('/menu', listMenuItems);
router.post('/menu', createMenuItem);
router.patch('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

export default router;