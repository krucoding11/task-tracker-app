/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("polls", function (table) {
      table.increments("id").primary();
      table.text("question").notNullable();
      table
        .integer("author_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("employees");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("poll_options", function (table) {
      table.increments("id").primary();
      table
        .integer("poll_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("polls")
        .onDelete("CASCADE");
      table.string("option_text").notNullable();
    })
    .createTable("poll_votes", function (table) {
      table.increments("id").primary();
      table
        .integer("poll_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("polls")
        .onDelete("CASCADE");
      table
        .integer("poll_option_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("poll_options")
        .onDelete("CASCADE");
      table
        .integer("employee_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("employees")
        .onDelete("CASCADE");
      table.unique(["poll_id", "employee_id"]); // Ensures one vote per employee per poll
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("poll_votes")
    .dropTableIfExists("poll_options")
    .dropTableIfExists("polls");
};
