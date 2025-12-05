// <timestamp>_create_reactions_table.js

exports.up = function (knex) {
  return knex.schema.createTable("reactions", (table) => {
    table.increments("id").primary();

    // 1. The ID of the item (e.g., 5)
    table.integer("reaction_target_id").notNullable();
    // 2. The type of the item (e.g., "announcement", "poll")
    table.string("reaction_target_type").notNullable();

    table
      .integer("employee_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    table.string("reaction_emoji").notNullable(); // "👍"

    // An employee can only have one reaction per target item
    table.unique(["employee_id", "reaction_target_id", "reaction_target_type"]);

    // Add indexes for fast lookups
    table.index(["reaction_target_id", "reaction_target_type"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reactions");
};
