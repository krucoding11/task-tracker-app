/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("leave_applications", (table) => {
      table.dropForeign(
        "leave_type_id",
        "leave_applications_leave_type_id_foreign",
      );
    })
    .alterTable("leave_applications", (table) => {
      table.dropColumn("leave_type_id");
    })
    .alterTable("leave_applications", (table) => {
      table
        .integer("leave_type_id")
        .unsigned()
        .references("id")
        .inTable("leave_types");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("leave_applications", (table) => {
      // 1. Drop the new foreign key and column
      table.dropColumn("leave_type_id");
    })
    .alterTable("leave_applications", (table) => {
      table.integer("leave_type_id");
    })
    .alterTable("leave_applications", (table) => {
      table
        .foreign("leave_type_id", "leave_applications_leave_type_id_foreign")
        .references("id")
        .inTable("leave_types");
    });
};
