// <timestamp>_create_comp_off_requests.js

exports.up = function (knex) {
  return knex.schema.createTable("comp_off_requests", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    // The manager who is granting this
    table
      .integer("manager_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    table.date("work_date").notNullable(); // The date they did overtime
    table.decimal("days_granted", 3, 1).notNullable(); // e.g., 1.0 or 0.5
    table.date("expiry_date").notNullable();
    table.text("reason").notNullable();
    table
      .enu("status", ["Pending", "Approved", "Rejected"])
      .defaultTo("Pending");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("comp_off_requests");
};
