// src/db/migrations/YYYYMMDDHHMMSS_create_attendance_and_leave_tables.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return (
    knex.schema
      // Table for different types of leave (e.g., Sick, Casual)
      .createTable("leave_types", function (table) {
        table.increments("id").primary();
        table.string("name", 50).notNullable().unique();
        table.boolean("is_paid").defaultTo(true);
        table.integer("default_days_per_year").notNullable();
      })
      // Table for employees to apply for leave
      .createTable("leave_applications", function (table) {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("leave_type_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("leave_types");
        table.date("start_date").notNullable();
        table.date("end_date").notNullable();
        table.text("reason");
        table.string("status", 20).notNullable().defaultTo("Pending");
        table
          .integer("approved_by_id")
          .unsigned()
          .references("id")
          .inTable("employees")
          .onDelete("SET NULL");
        table.timestamp("applied_at").defaultTo(knex.fn.now());
      })
      // Table to track the remaining leave days for each employee
      .createTable("employee_leave_balances", function (table) {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("leave_type_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("leave_types")
          .onDelete("CASCADE");
        table.decimal("balance", 4, 1).notNullable();
        table.unique(["employee_id", "leave_type_id"]);
      })
      // Table for daily attendance records
      .createTable("attendance", function (table) {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table.date("attendance_date").notNullable();
        table.time("check_in_time");
        table.time("check_out_time");
        table.string("status", 20).notNullable(); // e.g., 'Present', 'Absent', 'On Leave'
        table.unique(["employee_id", "attendance_date"]);
      })
      // Table for company-wide holidays
      .createTable("holidays", function (table) {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.date("holiday_date").notNullable().unique();
      })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("holidays")
    .dropTableIfExists("attendance")
    .dropTableIfExists("employee_leave_balances")
    .dropTableIfExists("leave_applications")
    .dropTableIfExists("leave_types");
};
