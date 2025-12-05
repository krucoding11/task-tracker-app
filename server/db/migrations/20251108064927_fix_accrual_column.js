// <timestamp>_fix_accrual_column.js

exports.up = function (knex) {
  // First, add the column to the correct table
  return knex.schema.table("leave_plan_rules", (table) => {
    table.boolean("is_accruable").defaultTo(false).notNullable();
  });
};

exports.down = function (knex) {
  // Reverts the changes
  return knex.schema
    .table("leave_types", (table) => {
      table.boolean("is_accruable").defaultTo(false).notNullable();
    })
    .then(() => {
      return knex.schema.table("leave_plan_rules", (table) => {
        table.dropColumn("is_accruable");
      });
    });
};
