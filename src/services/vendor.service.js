import { VendorRepository } from '../repositories/vendor.repository.js';
import { MenuRepository } from '../repositories/menu.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { deleteCache, deleteCacheByPattern } from '../utils/cache.js';

const vendorRepository = new VendorRepository();
const menuRepository = new MenuRepository();

const invalidateVendorMenuCache = async (vendorId) => {
  await deleteCache(`vendors:${vendorId}:menu`);
  await deleteCacheByPattern(`vendors:${vendorId}:menu:*`);
};

export class VendorService {
  async listMenuItems(vendorId) {
    return menuRepository.findByVendorId(vendorId);
  }

  async createMenuItem(vendorId, data) {
    const item = await menuRepository.create({ ...data, vendor_id: vendorId });
    await invalidateVendorMenuCache(vendorId);
    return item;
  }

  async updateMenuItem(vendorId, itemId, data) {
    const item = await menuRepository.updateByVendor(vendorId, itemId, data);
    if (!item) {
      throw new NotFoundError('Menu item not found or does not belong to your restaurant');
    }
    await invalidateVendorMenuCache(vendorId);
    return item;
  }

  async deleteMenuItem(vendorId, itemId) {
    const deleted = await menuRepository.deleteByVendor(vendorId, itemId);
    if (!deleted) {
      throw new NotFoundError('Menu item not found or does not belong to your restaurant');
    }
    await invalidateVendorMenuCache(vendorId);
  }
}