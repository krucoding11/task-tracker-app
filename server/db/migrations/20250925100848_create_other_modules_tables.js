// src/db/migrations/YYYYMMDDHHMMSS_create_other_modules_tables.js

exports.up = function (knex) {
  return (
    knex.schema
      // --- Recruitment Module ---
      .createTable("job_openings", (table) => {
        table.increments("id").primary();
        table.string("title", 100).notNullable();
        table
          .integer("department_id")
          .unsigned()
          .references("id")
          .inTable("departments");
        table.text("description");
        table.string("status", 20).notNullable().defaultTo("Open");
      })
      .createTable("applicants", (table) => {
        table.increments("id").primary();
        table.string("first_name", 50).notNullable();
        table.string("last_name", 50).notNullable();
        table.string("email", 100).notNullable().unique();
        table.string("phone", 20);
        table.string("resume_path", 255);
      })
      .createTable("applications", (table) => {
        table.increments("id").primary();
        table
          .integer("job_opening_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("job_openings")
          .onDelete("CASCADE");
        table
          .integer("applicant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("applicants")
          .onDelete("CASCADE");
        table.date("application_date").notNullable().defaultTo(knex.fn.now());
        table.string("status", 20).notNullable().defaultTo("Applied"); // Applied, Interview, Offered, Hired, Rejected
      })

      // --- Performance Module ---
      .createTable("performance_reviews", (table) => {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("reviewer_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("SET NULL");
        table.date("review_date").notNullable();
        table.decimal("rating", 3, 1);
        table.text("comments");
      })

      // --- Asset Module ---
      .createTable("assets", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.string("asset_type", 50);
        table.string("serial_number", 100).unique();
        table.date("purchase_date");
        table.string("status", 20).notNullable().defaultTo("Available"); // Available, Assigned, In Repair, Retired
      })
      .createTable("employee_assets", (table) => {
        table.increments("id").primary();
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("asset_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("assets")
          .onDelete("CASCADE");
        table.date("assigned_date").notNullable();
        table.date("return_date");
      })

      // --- Training Module ---
      .createTable("training_courses", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.text("description");
      })
      .createTable("employee_training", (table) => {
        table
          .integer("employee_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("employees")
          .onDelete("CASCADE");
        table
          .integer("course_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("training_courses")
          .onDelete("CASCADE");
        table.date("completion_date");
        table.string("score", 10);
        table.primary(["employee_id", "course_id"]);
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("employee_training")
    .dropTableIfExists("training_courses")
    .dropTableIfExists("employee_assets")
    .dropTableIfExists("assets")
    .dropTableIfExists("performance_reviews")
    .dropTableIfExists("applications")
    .dropTableIfExists("applicants")
    .dropTableIfExists("job_openings");
};
