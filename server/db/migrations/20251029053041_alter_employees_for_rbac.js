exports.up = function (knex) {
  return knex.schema.alterTable("employees", function (table) {
    // Drop the old text-based role column
    table.dropColumn("role");

    // Add the new foreign key column for role_id
    table
      .integer("role_id")
      .unsigned()
      .references("id")
      .inTable("roles")
      .nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("employees", function (table) {
    table.dropForeign("role_id");
    table.dropColumn("role_id");
    table.string("role");
  });
};
