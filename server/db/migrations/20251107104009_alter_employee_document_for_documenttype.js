/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("employee_documents", function (table) {
    table.dropColumn("document_type");
  });

  await knex.schema.alterTable("employee_documents", function (table) {
    table
      .integer("document_type_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("document_type")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("employee_documents", function (table) {
    table.dropForeign("document_type_id");
    table.dropColumn("document_type_id");
    table.string("document_type").notNullable();
  });
};
