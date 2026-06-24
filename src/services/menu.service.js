import { VendorRepository } from '../repositories/vendor.repository.js';
import { MenuRepository } from '../repositories/menu.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { getCache, setCache } from '../utils/cache.js';

const vendorRepository = new VendorRepository();
const menuRepository = new MenuRepository();

const CACHE_KEYS = {
  allVendors: 'vendors:all',
  vendor: (id) => `vendors:${id}`,
  vendorMenu: (id) => `vendors:${id}:menu`,
  menuItem: (vendorId, itemId) => `vendors:${vendorId}:menu:${itemId}`,
};

export class MenuService {
  async listVendors() {
    const cached = await getCache(CACHE_KEYS.allVendors);
    if (cached) return cached;

    const vendors = await vendorRepository.findAll();
    await setCache(CACHE_KEYS.allVendors, vendors);
    return vendors;
  }

  async getVendor(vendorId) {
    const cached = await getCache(CACHE_KEYS.vendor(vendorId));
    if (cached) return cached;

    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');

    await setCache(CACHE_KEYS.vendor(vendorId), vendor);
    return vendor;
  }

  async listVendorMenuItems(vendorId) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');

    const cached = await getCache(CACHE_KEYS.vendorMenu(vendorId));
    if (cached) return cached;

    const items = await menuRepository.findByVendorId(vendorId);
    await setCache(CACHE_KEYS.vendorMenu(vendorId), items);
    return items;
  }

  async getMenuItem(vendorId, itemId) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');

    const cached = await getCache(CACHE_KEYS.menuItem(vendorId, itemId));
    if (cached) return cached;

    const item = await menuRepository.findByIdAndVendor(vendorId, itemId);
    if (!item) throw new NotFoundError('Menu item not found');

    await setCache(CACHE_KEYS.menuItem(vendorId, itemId), item);
    return item;
  }
}