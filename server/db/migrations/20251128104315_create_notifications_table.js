/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary();

    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    table.string("title", 255).notNullable();
    table.text("message").notNullable();
    table.string("link", 500);

    table
      .enu("type", [
        "leave",
        "attendance",
        "task",
        "announcement",
        "poll",
        "general",
      ])
      .defaultTo("general");

    table.boolean("is_read").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("read_at").nullable();

    // Indexes for performance
    table.index("employee_id");
    table.index("is_read");
    table.index("created_at");
    table.index(["employee_id", "is_read"]); // Composite index for common query
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("notifications");
};
