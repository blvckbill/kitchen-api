export const up = async (knex) => {
  await knex.schema.createTable('customers', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('phone', 20);
    table.timestamps(true, true);

    table.index('email', 'idx_customers_email');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('customers');
};