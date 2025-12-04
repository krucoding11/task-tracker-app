exports.up = function (knex) {
  return knex.schema.table("projects", (table) => {
    table
      .specificType("attachment_ids", "integer[]")
      .defaultTo(knex.raw("ARRAY[]::INTEGER[]"));
  });
};

exports.down = function (knex) {
  return knex.schema.table("projects", (table) => {
    table.dropColumn("attachment_ids");
  });
};
