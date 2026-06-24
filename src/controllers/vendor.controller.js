import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menu.validator.js';
import { VendorService } from '../services/vendor.service.js';
import { successResponse } from '../utils/response.js';

const vendorService = new VendorService();

export const listMenuItems = async (req, res, next) => {
  try {
    const items = await vendorService.listMenuItems(req.vendor.id);
    return successResponse(res, items, 'Menu items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const data = createMenuItemSchema.parse(req.body);
    const item = await vendorService.createMenuItem(req.vendor.id, data);
    return successResponse(res, item, 'Menu item created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const data = updateMenuItemSchema.parse(req.body);
    const item = await vendorService.updateMenuItem(req.vendor.id, req.params.id, data);
    return successResponse(res, item, 'Menu item updated');
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    await vendorService.deleteMenuItem(req.vendor.id, req.params.id);
    return successResponse(res, null, 'Menu item deleted');
  } catch (error) {
    next(error);
  }
};