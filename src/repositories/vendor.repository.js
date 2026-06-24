import db from '../config/db.js';

export class VendorRepository {
  async findAll() {
    return db('vendors')
      .where({ is_active: true })
      .select(
        'id',
        'name',
        'description',
        'address',
        'phone',
        'email',
        'created_at'
      );
  }

  async findById(id) {
    return db('vendors')
      .where({ id, is_active: true })
      .select(
        'id',
        'name',
        'description',
        'address',
        'phone',
        'email',
        'created_at'
      )
      .first();
  }
}