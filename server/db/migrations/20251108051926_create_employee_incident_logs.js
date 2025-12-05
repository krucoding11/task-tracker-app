// <timestamp>_create_employee_incident_logs.js

exports.up = function (knex) {
  return knex.schema.createTable("employee_incident_logs", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    // This links to the 'Incident' leave type (e.g., "Marriage Leave")
    table
      .integer("leave_type_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("leave_types")
      .onDelete("CASCADE");

    table.date("event_date");
    table.text("notes");

    // This is the key: An employee can only use each incident type ONCE
    table.unique(["employee_id", "leave_type_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("employee_incident_logs");
};
