/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("leave_approval_logs", function (table) {
    table.increments("id").primary();

    table
      .integer("leave_application_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("leave_applications")
      .onDelete("CASCADE"); // If the application is deleted, its logs are deleted

    table.integer("step_number").notNullable(); // The step this log represents (e.g., 1, 2)

    table
      .integer("approver_role_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("roles"); // The role of the approver (e.g., "Manager")

    table
      .integer("approver_employee_id")
      .unsigned()
      .references("id")
      .inTable("employees"); // The actual person who approved

    table.enu("status", ["Approved", "Rejected"]).notNullable();
    table.text("comments");
    table.timestamp("action_at").defaultTo(knex.fn.now());

    table.index("leave_application_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("leave_approval_logs");
};
