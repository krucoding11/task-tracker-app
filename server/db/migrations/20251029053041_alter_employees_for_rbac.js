exports.up = function (knex) {
  return knex.schema.alterTable("employees", (table) => {
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
  return knex.schema.alterTable("employees", (table) => {
    table.dropForeign("role_id");
    table.dropColumn("role_id");
    table.string("role");
  });
};
