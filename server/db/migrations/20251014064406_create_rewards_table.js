exports.up = function (knex) {
  return knex.schema.createTable("rewards", (table) => {
    table.increments("id").primary();
    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");
    table
      .integer("given_by_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("SET NULL");
    table.string("reward_type").notNullable(); // e.g., 'Star Performer', 'Spot Award'
    table.text("reason").notNullable();
    table.date("reward_date").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("rewards");
};
