// <timestamp>_alter_employees_add_leave_plan.js

exports.up = function (knex) {
  return knex.schema.table("employees", (table) => {
    table
      .integer("leave_plan_id")
      .unsigned()
      .references("id")
      .inTable("leave_plans")
      .onDelete("SET NULL"); // If plan is deleted, set employee's plan to null
  });
};

exports.down = function (knex) {
  return knex.schema.table("employees", (table) => {
    table.dropForeign("leave_plan_id");
    table.dropColumn("leave_plan_id");
  });
};
