exports.up = function (knex) {
  return knex.schema.table("tasks", (table) => {
    table
      .integer("creator_id")
      .unsigned()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tasks", (table) => {
    table.dropColumn("creator_id");
  });
};
