export const up = async (knex) => {
  await knex.schema.createTable('menu_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('vendor_id').notNullable();
    table.string('name', 255).notNullable();
    table.text('description');
    table.integer('price').notNullable(); // stored in kobo
    table.string('category', 100);
    table.boolean('is_available').defaultTo(true);
    table.timestamps(true, true);

    table.foreign('vendor_id').references('vendors.id').onDelete('CASCADE');
    table.index('vendor_id', 'idx_menu_items_vendor_id');
    table.index('is_available', 'idx_menu_items_is_available');
    table.index('category', 'idx_menu_items_category');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('menu_items');
};