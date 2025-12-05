exports.up = function (knex) {
  return knex.schema.createTable("attachments", (table) => {
    table.increments("id").primary();
    table.string("filename", 255).notNullable();
    table.text("storage_path").notNullable();
    table.string("mimetype", 50);
    table.integer("filesize");
    table
      .integer("uploaded_by")
      .unsigned()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("attachments");
};
