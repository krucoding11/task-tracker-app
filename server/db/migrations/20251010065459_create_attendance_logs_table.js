exports.up = function (knex) {
  return knex.schema.createTable("attendance_logs", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.timestamp("punch_time").notNullable(); // Stores the full date and time
    table.string("punch_type").notNullable(); // 'IN' or 'OUT'
    // Add a unique constraint to prevent inserting the exact same punch twice
    table.unique(["employee_id", "punch_time"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("attendance_logs");
};
