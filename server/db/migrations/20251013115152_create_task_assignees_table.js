/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('task_assignees', (table) => {
    table.increments('id').primary();
    table.uuid('task_id').references('id').inTable('tasks').onDelete('CASCADE');
    table
      .integer('employee_id')
      .unsigned()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('task_assignees');
};
