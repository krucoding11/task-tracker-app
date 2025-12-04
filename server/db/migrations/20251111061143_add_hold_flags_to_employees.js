// <timestamp>_add_hold_flags_to_employees.js

exports.up = function (knex) {
  return knex.schema.table("employees", function (table) {
    // For Step 5: Salary Processing on Hold
    table.boolean("is_salary_processing_held").defaultTo(false).notNullable();

    // For Step 5: Salary Payout on Hold
    table.boolean("is_salary_payout_held").defaultTo(false).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table("employees", function (table) {
    table.dropColumn("is_salary_processing_held");
    table.dropColumn("is_salary_payout_held");
  });
};
