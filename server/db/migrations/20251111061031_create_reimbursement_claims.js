// <timestamp>_create_reimbursement_claims.js

exports.up = function (knex) {
  return knex.schema.createTable("reimbursement_claims", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    table.string("claim_type").notNullable(); // e.g., "Travel", "Phone Bill", "Food"
    table.decimal("amount", 10, 2).notNullable();
    table.date("claim_date").notNullable();
    table.text("description");
    table.string("attachment_url"); // Link to the uploaded bill

    table
      .enu("status", ["Pending", "Approved", "Rejected"])
      .defaultTo("Pending");

    table
      .integer("approved_by_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reimbursement_claims");
};
