/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("employees", (table) => {
    // Add columns after the 'work_email' column for better organization
    table.string("personal_email", 100).unique().after("work_email");
    table.string("phone_number", 20).after("personal_email");
    table.date("dob").after("phone_number");
    table.string("gender", 10).after("dob");
    table.text("address").after("gender");
    table.date("termination_date").after("hire_date");
    table
      .string("employee_status", 20)
      .notNullable()
      .defaultTo("Active")
      .after("termination_date");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("employees", (table) => {
    // The 'down' function should drop the columns in reverse order
    table.dropColumn("employee_status");
    table.dropColumn("termination_date");
    table.dropColumn("address");
    table.dropColumn("gender");
    table.dropColumn("dob");
    table.dropColumn("phone_number");
    table.dropColumn("personal_email");
  });
};
