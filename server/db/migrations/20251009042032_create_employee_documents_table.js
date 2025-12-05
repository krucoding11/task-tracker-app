/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("employee_documents", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");
    table.string("document_type").notNullable(); // e.g., 'Aadhar Card', 'PAN Card'
    table.string("file_path").notNullable();
    table.string("original_filename").notNullable();
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("employees", (table) => {
    table.dropColumn("termination_reason");
  });
};
