exports.up = function (knex) {
  return knex.schema.table("task_comments", (table) => {
    table
      .integer("assigned_to_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL")
      .comment("Employee ID to whom this comment is assigned");

    table
      .boolean("is_resolved")
      .defaultTo(false)
      .comment("Whether the assigned comment has been resolved");
  });
};

exports.down = function (knex) {
  return knex.schema.table("task_comments", (table) => {
    table.dropColumn("assigned_to_id");
    table.dropColumn("is_resolved");
  });
};
