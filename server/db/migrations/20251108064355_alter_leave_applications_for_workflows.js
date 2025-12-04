// <timestamp>_alter_leave_applications_for_workflows.js

exports.up = function (knex) {
  return knex.schema.table("leave_applications", function (table) {
    // 1. Add column to link to the workflow
    table
      .integer("approval_workflow_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("approval_workflows")
      .onDelete("SET NULL");

    // 2. Add column to track current step
    table.integer("current_step_number").defaultTo(1);

    // 3. Drop the old, simple approval column
    table.dropColumn("approved_by_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("leave_applications", function (table) {
    // Re-add the old column
    table
      .integer("approved_by_id")
      .unsigned()
      .references("id")
      .inTable("employees");

    // Drop the new columns
    table.dropForeign("approval_workflow_id");
    table.dropColumn("approval_workflow_id");
    table.dropColumn("current_step_number");
  });
};
