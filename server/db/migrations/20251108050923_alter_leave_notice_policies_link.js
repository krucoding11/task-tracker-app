// <timestamp>_alter_leave_notice_policies_link.js

exports.up = function (knex) {
  return knex.schema.alterTable("leave_notice_policies", function (table) {
    // 1. Drop the old link
    table.dropForeign("leave_type_id");
    table.dropColumn("leave_type_id");

    // 2. Add the new link to the main 'rules' table
    table
      .integer("leave_plan_rule_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("leave_plan_rules")
      .onDelete("CASCADE"); // If the rule is deleted, delete its notice policies
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("leave_notice_policies", function (table) {
    table.dropForeign("leave_plan_rule_id");
    table.dropColumn("leave_plan_rule_id");

    // Re-add the old column
    table
      .integer("leave_type_id")
      .unsigned()
      .references("id")
      .inTable("leave_types");
  });
};
