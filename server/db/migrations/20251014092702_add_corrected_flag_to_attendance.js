exports.up = function (_knex) {
  return _knex.schema.alterTable("attendance", (table) => {
    table.boolean("is_corrected").defaultTo(false);
  });
};
exports.down = function (_knex) {
  /* ... */
};
