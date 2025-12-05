exports.up = function (knex) {
  return knex.schema.alterTable("employee_leave_balances", (table) => {
    // This will store the initial allotted days for the year
    table.decimal("total_allotted_days", 4, 1).notNullable().defaultTo(0);
  });
};
exports.down = function (_knex) {
  /* ... */
};
