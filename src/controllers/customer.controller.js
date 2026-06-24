import { MenuService } from '../services/menu.service.js';
import { successResponse } from '../utils/response.js';
import { serializeMenuCollection, serializeMenuItem } from '../utils/serializer.js';

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
    // Transform collection to Naira before serialization
    const formattedItems = serializeMenuCollection(items);
    return successResponse(res, formattedItems, 'Menu items retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItem(req.params.id, req.params.itemId);
    // Transform single item to Naira before serialization
    const formattedItem = serializeMenuItem(item);
    return successResponse(res, formattedItem, 'Menu item retrieved');
  } catch (error) {
    next(error);
  }
};