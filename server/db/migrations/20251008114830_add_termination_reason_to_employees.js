exports.up = function (_knex) {
  return _knex.schema.alterTable("employees", (table) => {
    table.text("termination_reason").after("termination_date");
  });
};
exports.down = function (_knex) {
  /* ... */
};
