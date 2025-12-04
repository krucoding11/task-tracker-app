// <timestamp>_add_violation_reason_to_leave.js

exports.up = function (knex) {
  return knex.schema.table("leave_applications", function (table) {
    table.boolean("is_paid").defaultTo(false);
    table.text("violation_reason").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table("leave_applications", function (table) {
    table.boolean("is_paid").defaultTo(false);
    table.dropColumn("violation_reason");
  });
};
