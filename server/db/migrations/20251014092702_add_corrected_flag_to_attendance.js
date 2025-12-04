exports.up = function (knex) {
  return knex.schema.alterTable("attendance", function (table) {
    table.boolean("is_corrected").defaultTo(false);
  });
};
exports.down = function (knex) {
  /* ... */
};
