import { VendorRepository } from '../repositories/vendor.repository.js';
import { MenuRepository } from '../repositories/menu.repository.js';
import { NotFoundError } from '../utils/errors.js';

const vendorRepository = new VendorRepository();
const menuRepository = new MenuRepository();

export class MenuService {
  async listVendors() {
    return vendorRepository.findAll();
  }

  async getVendor(vendorId) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return vendor;
  }

  async listVendorMenuItems(vendorId) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return menuRepository.findByVendorId(vendorId);
  }

  async getMenuItem(vendorId, itemId) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    const item = await menuRepository.findByIdAndVendor(vendorId, itemId);
    if (!item) {
      throw new NotFoundError('Menu item not found');
    }
    return item;
  }
}