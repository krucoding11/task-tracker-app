// <timestamp>_create_approval_workflows.js

exports.up = function (knex) {
  return knex.schema.createTable("approval_workflows", function (table) {
    table.increments("id").primary();
    table.string("workflow_name").notNullable().unique();
    table.text("description");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("approval_workflows");
};
