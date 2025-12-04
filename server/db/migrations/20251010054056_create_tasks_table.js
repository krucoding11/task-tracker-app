/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()')); // UUID for task
    table
      .integer('project_id')
      .unsigned()
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');
    table
      .integer('assigned_to')
      .unsigned()
      .references('id')
      .inTable('employees')
      .onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description');
    table.enu('priority', ['High', 'Medium', 'Low']).defaultTo('Low');
    table
      .enu('status', [
        'Pending',
        'In-Progress',
        'Paused',
        'Review',
        'Done',
        'Completed',
        'Cancelled',
      ])
      .defaultTo('Pending');
    table.date('start_date');
    table.date('due_date');
    table.float('estimated_hours').defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tasks');
};
