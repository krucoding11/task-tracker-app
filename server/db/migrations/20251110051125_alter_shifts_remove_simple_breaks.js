// <timestamp>_alter_shifts_remove_simple_breaks.js

exports.up = function (knex) {
  return knex.schema.table("shifts", (table) => {
    table.dropColumn("break_duration_minutes");
  });
};

exports.down = function (knex) {
  // Re-adds the old columns if you roll back
  return knex.schema.table("shifts", (table) => {
    table.integer("break_duration_minutes").defaultTo(60);
  });
};
