// <timestamp>_refactor_asset_assignments.js

exports.up = async function (knex) {
  // --- Step 1: Create the new, more flexible table ---
  await knex.schema.createTable("asset_assignments", function (table) {
    table.increments("id").primary();

    table
      .integer("asset_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("assets")
      .onDelete("CASCADE");

    table
      .integer("employee_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");

    table.string("assign_to").nullable();
    table.date("assigned_date").defaultTo(knex.fn.now());
    table.date("expected_return_date").nullable();
    table.date("actual_return_date").nullable();

    table.index("asset_id");
  });

  // --- Step 2: Add the CHECK constraint using knex.raw() ---
  // This is a safer way to add a constraint and avoids the binding error.
  await knex.raw(`
    ALTER TABLE "asset_assignments"
    ADD CONSTRAINT "asset_assignment_check"
    CHECK (
      (employee_id IS NOT NULL AND assign_to IS NULL) OR
      (employee_id IS NULL AND assign_to IS NOT NULL) OR
      (employee_id IS NULL AND assign_to IS NULL)
    );
  `);

  // --- Step 3: Migrate old data from 'employee_assets' ---
  const oldAssignments = await knex("employee_assets").select("*");

  if (oldAssignments.length > 0) {
    const newAssignments = oldAssignments.map((assignment) => ({
      asset_id: assignment.asset_id,
      employee_id: assignment.employee_id,
      assign_to: null,
      assigned_date: assignment.assigned_date,
      actual_return_date: assignment.return_date || null,
    }));
    await knex("asset_assignments").insert(newAssignments);
  }

  // --- Step 4: Drop the old table ---
  await knex.schema.dropTable("employee_assets");
};

exports.down = async function (knex) {
  // --- Step 1: Create the old 'employee_assets' table ---
  await knex.schema.createTable("employee_assets", function (table) {
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
  });

  // --- Step 2: Try to move data back (only employee assignments) ---
  const newAssignments = await knex("asset_assignments")
    .whereNotNull("employee_id")
    .select("*");

  if (newAssignments.length > 0) {
    const oldAssignments = newAssignments.map((assignment) => ({
      employee_id: assignment.employee_id,
      asset_id: assignment.asset_id,
      assigned_date: assignment.assigned_date,
      return_date: assignment.actual_return_date,
    }));
    await knex("employee_assets").insert(oldAssignments);
  }

  // --- Step 3: Drop the new 'asset_assignments' table ---
  await knex.schema.dropTable("asset_assignments");
};
