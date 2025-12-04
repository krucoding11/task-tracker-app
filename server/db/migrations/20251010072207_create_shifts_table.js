exports.up = function (knex) {
  return knex.schema
    .createTable("shifts", function (table) {
      table.increments("id").primary();
      table.string("shift_name").notNullable().unique(); // e.g., "General Shift", "Night Shift"
      table.time("start_time").notNullable();
      table.time("end_time").notNullable();
      table.integer("break_duration_minutes").notNullable().defaultTo(60);
    })
    .then(() => {
      return knex.schema.alterTable("employees", function (table) {
        // Add a foreign key to link each employee to a shift
        table
          .integer("shift_id")
          .unsigned()
          .references("id")
          .inTable("shifts")
          .nullable();
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("employees", function (table) {
      table.dropColumn("shift_id");
    })
    .then(() => {
      return knex.schema.dropTableIfExists("shifts");
    });
};
