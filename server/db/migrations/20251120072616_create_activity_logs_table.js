/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("activity_logs", (table) => {
    // Unique log ID
    table.increments("id").primary();

    // ID of the user who performed the operation (links to employees.id)
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL") // If an employee record is deleted, keep the log but nullify user_id
      .index();

    // Type of action: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
    table.string("action_type", 50).notNullable();

    // Resource type: 'employee', 'shift', 'role', 'payroll', etc.
    table.string("resource_type", 50).notNullable();

    // The ID of the item affected (e.g., employee ID, role ID).
    table.string("resource_id", 255).nullable().index();

    // Detailed changes, old vs. new values (JSONB is optimized for structured data in PostgreSQL)
    table.jsonb("changes").nullable();

    // When the operation occurred
    table.timestamp("timestamp").defaultTo(knex.fn.now()).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("activity_logs");
};
