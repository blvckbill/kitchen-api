import { MenuService } from '../services/menu.service.js';
import { successResponse } from '../utils/response.js';

const menuService = new MenuService();

export const listVendors = async (req, res, next) => {
  try {
    const vendors = await menuService.listVendors();
    return successResponse(res, vendors, 'Vendors retrieved');
  } catch (error) {
    next(error);
  }
};

export const getVendor = async (req, res, next) => {
  try {
    const vendor = await menuService.getVendor(req.params.id);
    return successResponse(res, vendor, 'Vendor retrieved');
  } catch (error) {
    next(error);
  }
};

export const listVendorMenuItems = async (req, res, next) => {
  try {
    const items = await menuService.listVendorMenuItems(req.params.id);
    return successResponse(res, items, 'Menu items retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItem(req.params.id, req.params.itemId);
    return successResponse(res, item, 'Menu item retrieved');
  } catch (error) {
    next(error);
  }
};