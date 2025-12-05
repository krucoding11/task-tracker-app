exports.up = function (knex) {
  return (
    knex.schema
      // Add the machine ID column to the employees table
      .alterTable("employees", (table) => {
        table.string("machine_user_id").unique().nullable();
      })
      // Create a new table for attendance correction requests
      .createTable("attendance_requests", (table) => {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table.date("request_date").notNullable();
        table.time("requested_check_in").nullable();
        table.time("requested_check_out").nullable();
        table.text("reason").notNullable();
        table.string("status").notNullable().defaultTo("Pending"); // Pending, Approved, Rejected
        table
          .integer("approved_by_id")
          .unsigned()
          .references("id")
          .inTable("employees")
          .onDelete("SET NULL");
      })
  );
};
exports.down = function () {
  /* ... */
};
