import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menu.validator.js';
import { VendorService } from '../services/vendor.service.js';
import { successResponse } from '../utils/response.js';
import { serializeMenuCollection, serializeMenuItem, parseToKobo } from '../utils/serializer.js';

const vendorService = new VendorService();

export const listMenuItems = async (req, res, next) => {
  try {
    const items = await vendorService.listMenuItems(req.vendor.id);
    const formattedItems = serializeMenuCollection(items);
    return successResponse(res, formattedItems, 'Menu items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const data = createMenuItemSchema.parse(req.body);
    
    // Inbound Normalization: Convert incoming Naira price to safe database kobo
    if (data.price !== undefined) {
      data.price = parseToKobo(data.price);
    }

    const item = await vendorService.createMenuItem(req.vendor.id, data);
    
    // Outbound Serialization: Map the saved repository record back to Naira
    const formattedItem = serializeMenuItem(item);
    return successResponse(res, formattedItem, 'Menu item created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const data = updateMenuItemSchema.parse(req.body);
    
    // Inbound Normalization: Convert incoming patch adjustments to safe kobo if present
    if (data.price !== undefined) {
      data.price = parseToKobo(data.price);
    }

    const item = await vendorService.updateMenuItem(req.vendor.id, req.params.id, data);
    const formattedItem = serializeMenuItem(item);
    return successResponse(res, formattedItem, 'Menu item updated');
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