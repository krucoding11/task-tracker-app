/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("announcement_comments", (table) => {
    table.increments("id").primary();

    // FK — Announcement
    table
      .integer("announcement_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("announcements")
      .onDelete("CASCADE");

    // FK — Employee (commenter)
    table
      .integer("employee_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");

    // Text comment
    table.text("comment").nullable();

    // Array of attachment IDs
    table.specificType("attachment_ids", "INT[]").defaultTo("{}");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index("announcement_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("announcement_comments");
};
