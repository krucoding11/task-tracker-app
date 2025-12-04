// <timestamp>_create_payroll_arrears.js

exports.up = function (knex) {
  return knex.schema.createTable("payroll_arrears", function (table) {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    // The pay period this arrear will be PAID IN (e.g., "2025-11")
    table.string("pay_period", 7).notNullable();

    table.string("arrear_type").notNullable(); // e.g., "Salary Revision", "LOP Reversal"
    table.decimal("amount", 10, 2).notNullable();
    table.text("comments");

    table.enu("status", ["Pending", "Paid"]).defaultTo("Pending");

    table.index(["employee_id", "pay_period"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payroll_arrears");
};
