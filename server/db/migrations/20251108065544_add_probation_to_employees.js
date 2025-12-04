// <timestamp>_add_probation_to_employees.js

exports.up = function (knex) {
  return knex.schema.table("employees", function (table) {
    // The number of days the employee is on probation (e.g., 90)
    table.integer("probation_days").defaultTo(0).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table("employees", function (table) {
    table.dropColumn("probation_days");
  });
};
