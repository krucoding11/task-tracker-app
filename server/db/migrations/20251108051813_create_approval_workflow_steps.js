// <timestamp>_create_approval_workflow_steps.js

exports.up = function (knex) {
  return knex.schema.createTable("approval_workflow_steps", function (table) {
    table.increments("id").primary();
    table
      .integer("workflow_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("approval_workflows")
      .onDelete("CASCADE");

    table.integer("step_number").notNullable(); // e.g., 1, 2, 3

    // This links to your 'roles' table
    table
      .integer("role_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE");

    // Ensures you can't have two "Step 1"s for the same workflow
    table.unique(["workflow_id", "step_number"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("approval_workflow_steps");
};
