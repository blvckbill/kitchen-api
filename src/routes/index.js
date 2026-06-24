import { Router } from 'express';
import vendorRoutes from './vendor.routes.js';
import customerRoutes from './customer.routes.js';

const router = Router();

router.use('/vendor', vendorRoutes);
router.use('/customer', customerRoutes);

export default router;