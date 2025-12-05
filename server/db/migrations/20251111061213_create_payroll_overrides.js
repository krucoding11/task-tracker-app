// <timestamp>_create_payroll_overrides.js

exports.up = function (knex) {
  return knex.schema.createTable("payroll_overrides", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    // The pay period this override applies to (e.g., "2025-11")
    table.string("pay_period", 7).notNullable();

    // Store only the new, overridden values
    // Use 'decimal' for financial data
    table.decimal("professional_tax", 10, 2).nullable(); // PT
    table.decimal("employee_state_insurance", 10, 2).nullable(); // ESI
    table.decimal("tax_deducted_at_source", 10, 2).nullable(); // TDS
    table.decimal("labour_welfare_fund", 10, 2).nullable(); // LWF

    table.text("comments");
    table.integer("admin_id").unsigned().references("id").inTable("employees");

    // An employee can only have one override record per month
    table.unique(["employee_id", "pay_period"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payroll_overrides");
};
