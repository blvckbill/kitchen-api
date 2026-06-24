export const up = async (knex) => {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('customer_id').notNullable()
      .references('id').inTable('customers').onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.boolean('is_revoked').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);

    table.index('token', 'idx_refresh_tokens_token');
    table.index('customer_id', 'idx_refresh_tokens_customer_id');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('refresh_tokens');
};