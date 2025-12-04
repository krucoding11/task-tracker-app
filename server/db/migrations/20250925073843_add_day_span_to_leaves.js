// src/db/migrations/YYYYMMDDHHMMSS_add_day_span_to_leaves.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("leave_applications", function (table) {
    table
      .string("day_span", 20)
      .notNullable()
      .defaultTo("FullDay")
      .after("reason");
    table
      .decimal("total_days", 4, 1)
      .notNullable()
      .defaultTo(1.0)
      .after("day_span");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("leave_applications", function (table) {
    table.dropColumn("total_days");
    table.dropColumn("day_span");
  });
};
