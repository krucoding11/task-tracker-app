/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("time_entries", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); // unique ID for time entry
    table.uuid("task_id").references("id").inTable("tasks").onDelete("CASCADE");
    table
      .integer("employee_id")
      .unsigned()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.date("date").notNullable();
    table.float("hours_spent").notNullable();
    table.text("note");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("time_entries");
};
