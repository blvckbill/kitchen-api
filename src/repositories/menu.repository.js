import db from '../config/db.js';

export class MenuRepository {
  async findByVendorId(vendorId) {
    return db('menu_items')
      .where({ vendor_id: vendorId })
      .select(
        'id',
        'vendor_id',
        'name',
        'description',
        'price',
        'category',
        'is_available',
        'created_at',
        'updated_at'
      );
  }

  async findByIdAndVendor(vendorId, itemId) {
    return db('menu_items')
      .where({ id: itemId, vendor_id: vendorId })
      .first();
  }

  async create(data) {
    const [item] = await db('menu_items').insert(data).returning('*');
    return item;
  }

  async updateByVendor(vendorId, itemId, data) {
    const [item] = await db('menu_items')
      .where({ id: itemId, vendor_id: vendorId })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');
    return item || null;
  }

  async deleteByVendor(vendorId, itemId) {
    const deleted = await db('menu_items')
      .where({ id: itemId, vendor_id: vendorId })
      .delete();
    return deleted > 0;
  }
}