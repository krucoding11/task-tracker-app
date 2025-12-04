// src/db/migrations/YYYYMMDDHHMMSS_create_payroll_and_benefits_tables.js

exports.up = function (knex) {
  return (
    knex.schema
      // Master list of all benefits the company offers
      .createTable("benefits", function (table) {
        table.increments("id").primary();
        table.string("name", 100).notNullable().unique();
        table.string("provider", 100);
        table.text("description");
      })
      // Link table to assign benefits to employees (Many-to-Many)
      .createTable("employee_benefits", function (table) {
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("benefit_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("benefits")
          .onDelete("CASCADE");
        table.date("enrollment_date").notNullable();
        table.primary(["employee_id", "benefit_id"]); // Composite primary key
      })
      // Master list of salary components (e.g., Basic, HRA, Provident Fund)
      .createTable("salary_components", function (table) {
        table.increments("id").primary();
        table.string("name", 100).notNullable().unique();
        table.string("type", 20).notNullable(); // 'Earning' or 'Deduction'
      })
      // Stores the salary history for each employee
      .createTable("employee_salary_history", function (table) {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("component_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("salary_components")
          .onDelete("CASCADE");
        table.decimal("amount", 12, 2).notNullable();
        table.date("effective_start_date").notNullable();
        table.date("effective_end_date"); // Null means it's the current salary
      })
      // Stores the generated payslip for each employee for each pay period
      .createTable("payrolls", function (table) {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table.date("pay_period_start").notNullable();
        table.date("pay_period_end").notNullable();
        table.decimal("gross_salary", 12, 2).notNullable();
        table.decimal("total_deductions", 12, 2).notNullable();
        table.decimal("net_salary", 12, 2).notNullable();
        table.string("status", 20).notNullable().defaultTo("Generated");
        table.date("paid_date");
        table.unique(["employee_id", "pay_period_start"]);
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("payrolls")
    .dropTableIfExists("employee_salary_history")
    .dropTableIfExists("salary_components")
    .dropTableIfExists("employee_benefits")
    .dropTableIfExists("benefits");
};
