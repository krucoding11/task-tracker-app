/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("refresh_tokens", (table) => {
    table.increments("id").primary();
    table.string("token").notNullable().unique();
    table.integer("employee_id").unsigned().notNullable();
    table.foreign("employee_id").references("employees.id").onDelete("CASCADE");
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("refresh_tokens");
};
