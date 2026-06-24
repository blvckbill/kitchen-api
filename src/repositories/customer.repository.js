import db from '../config/db.js';

export class CustomerRepository {
  async findByEmail(email) {
    return db('customers').where({ email }).first();
  }

  async findById(id) {
    return db('customers').where({ id }).first();
  }

  async create(data) {
    const [customer] = await db('customers').insert(data).returning('*');
    return customer;
  }
}

export class RefreshTokenRepository {
  async create(customerId, token, expiresAt) {
    const [refreshToken] = await db('refresh_tokens').insert({
      customer_id: customerId,
      token,
      expires_at: expiresAt,
    }).returning('*');
    return refreshToken;
  }

  async findByToken(token) {
    return db('refresh_tokens')
      .where({ token, is_revoked: false })
      .where('expires_at', '>', db.fn.now())
      .first();
  }

  async revokeToken(token) {
    return db('refresh_tokens')
      .where({ token })
      .update({ is_revoked: true });
  }

  async revokeAllForCustomer(customerId) {
    return db('refresh_tokens')
      .where({ customer_id: customerId })
      .update({ is_revoked: true });
  }
}