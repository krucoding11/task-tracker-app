// src/db/migrations/YYYYMMDDHHMMSS_create_initial_tables.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("departments", (table) => {
      table.increments("id").primary();
      table.string("name", 100).notNullable().unique();
      table.text("description");
    })
    .createTable("designations", (table) => {
      table.increments("id").primary();
      table.string("title", 100).notNullable().unique();
      table.text("description");
    })
    .createTable("employees", (table) => {
      table.increments("id").primary();
      table.string("employee_id", 20).notNullable().unique();
      table.string("first_name", 50).notNullable();
      table.string("last_name", 50).notNullable();
      table.string("work_email", 100).notNullable().unique();
      table.date("hire_date").notNullable();
      table.string("password").notNullable();
      table.string("role").notNullable().defaultTo("Employee");
      table
        .integer("department_id")
        .unsigned()
        .references("id")
        .inTable("departments")
        .onDelete("SET NULL");
      table
        .integer("designation_id")
        .unsigned()
        .references("id")
        .inTable("designations")
        .onDelete("SET NULL");
      table
        .integer("manager_id")
        .unsigned()
        .references("id")
        .inTable("employees")
        .onDelete("SET NULL");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Drop tables in reverse order of creation due to foreign key constraints
  return knex.schema
    .dropTableIfExists("employees")
    .dropTableIfExists("designations")
    .dropTableIfExists("departments");
};
