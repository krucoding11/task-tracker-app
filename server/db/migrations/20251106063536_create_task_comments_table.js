exports.up = function (knex) {
  return knex.schema.createTable("task_comments", (table) => {
    table.increments("id").primary();
    table
      .uuid("task_id")
      .notNullable()
      .references("id")
      .inTable("tasks")
      .onDelete("CASCADE");
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    // Comment content
    table.text("comment_text").notNullable();

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("task_comments");
};
