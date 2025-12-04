exports.up = function (knex) {
  return knex.schema.alterTable("employees", function (table) {
    table.text("termination_reason").after("termination_date");
  });
};
exports.down = function (knex) {};
