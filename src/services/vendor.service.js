import { VendorRepository } from '../repositories/vendor.repository.js';
import { MenuRepository } from '../repositories/menu.repository.js';
import { NotFoundError } from '../utils/errors.js';

const vendorRepository = new VendorRepository();
const menuRepository = new MenuRepository();

export class VendorService {
  async listMenuItems(vendorId) {
    return menuRepository.findByVendorId(vendorId);
  }

  async createMenuItem(vendorId, data) {
    return menuRepository.create({ ...data, vendor_id: vendorId });
  }

  async updateMenuItem(vendorId, itemId, data) {
    const item = await menuRepository.updateByVendor(vendorId, itemId, data);
    if (!item) {
      throw new NotFoundError('Menu item not found or does not belong to your restaurant');
    }
    return item;
  }

  async deleteMenuItem(vendorId, itemId) {
    const deleted = await menuRepository.deleteByVendor(vendorId, itemId);
    if (!deleted) {
      throw new NotFoundError('Menu item not found or does not belong to your restaurant');
    }
  }
}