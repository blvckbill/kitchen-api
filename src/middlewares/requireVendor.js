import { z } from 'zod';
import db from '../config/db.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

const uuidSchema = z.string().uuid();

export const requireVendor = async (req, res, next) => {
  try {
    const vendorId = req.headers['x-vendor-id'];

    if (!vendorId) {
      throw new UnauthorizedError('Missing x-vendor-id header');
    }

    // Validate UUID format
    const result = uuidSchema.safeParse(vendorId);
    if (!result.success) {
      throw new UnauthorizedError('Invalid vendor ID format');
    }

    // Verify vendor exists in DB
    const vendor = await db('vendors')
      .where({ id: vendorId, is_active: true })
      .first();

    if (!vendor) {
      throw new ForbiddenError('Vendor not found or inactive');
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};