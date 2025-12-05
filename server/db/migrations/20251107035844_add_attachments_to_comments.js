exports.up = function (knex) {
  return knex.schema.table("task_comments", (table) => {
    table
      .specificType("attachment_ids", "integer[]")
      .defaultTo(knex.raw("ARRAY[]::INTEGER[]"));
  });
};

exports.down = function (knex) {
  return knex.schema.table("task_comments", (table) => {
    table.dropColumn("attachment_ids");
  });
};
