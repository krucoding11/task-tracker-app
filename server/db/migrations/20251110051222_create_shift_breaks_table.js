// <timestamp>_create_shift_breaks_table.js

exports.up = function (knex) {
  return knex.schema.createTable("shift_breaks", (table) => {
    table.increments("id").primary();

    table
      .integer("shift_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("shifts")
      .onDelete("CASCADE"); // If shift is deleted, its breaks are deleted

    table.string("break_name").notNullable(); // e.g., "Lunch", "Tea Break"
    table.time("start_time").notNullable(); // e.g., "13:00:00"
    table.time("end_time").notNullable(); // e.g., "14:00:00"

    table.boolean("is_main_break").defaultTo(false).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("shift_breaks");
};
