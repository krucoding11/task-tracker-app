// <timestamp>_create_leave_plans.js

exports.up = function (knex) {
  return knex.schema.createTable("leave_plans", function (table) {
    table.increments("id").primary();
    table.string("plan_name").notNullable().unique();
    table.text("description");

    table.boolean("sandwich_policy_holidays").defaultTo(false);
    table.boolean("sandwich_policy_weekends").defaultTo(false);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("leave_plans");
};
