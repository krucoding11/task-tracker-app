/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("employee_job_history", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");
    table
      .integer("designation_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("designations");
    table
      .integer("department_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("departments");
    table
      .integer("manager_id")
      .unsigned()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");
    table.date("start_date").notNullable();
    table.date("end_date");
    table.string("change_reason", 255);
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("employee_job_history");
};
