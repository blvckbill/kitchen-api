export const up = async (knex) => {
  await knex.schema.createTable('vendors', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name', 255).notNullable().unique();
    table.text('description');
    table.string('address', 255);
    table.string('phone', 20);
    table.string('email', 255).unique();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index('name', 'idx_vendors_name');
    table.index('is_active', 'idx_vendors_is_active');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('vendors');
};