// <timestamp>_alter_leave_plan_rules_add_workflow.js

exports.up = function (knex) {
  return knex.schema.table("leave_plan_rules", function (table) {
    table
      .integer("approval_workflow_id")
      .unsigned()
      .references("id")
      .inTable("approval_workflows")
      .onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.table("leave_plan_rules", function (table) {
    table.dropForeign("approval_workflow_id");
    table.dropColumn("approval_workflow_id");
  });
};
