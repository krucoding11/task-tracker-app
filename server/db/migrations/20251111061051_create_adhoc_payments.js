// <timestamp>_create_adhoc_payments.js

exports.up = function (knex) {
  return knex.schema.createTable("adhoc_payments", function (table) {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    // The month this payment applies to (e.g., "2025-11")
    table.string("pay_period", 7).notNullable();

    table.string("payment_type").notNullable(); // e.g., "Joining Bonus", "Referral Bonus"
    table.decimal("amount", 10, 2).notNullable();
    table.text("comments");

    table
      .integer("added_by_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("adhoc_payments");
};
