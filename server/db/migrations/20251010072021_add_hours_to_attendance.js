exports.up = function (knex) {
  return knex.schema.alterTable("attendance", (table) => {
    table.time("gross_hours").nullable();
    table.time("effective_hours").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("attendance", (table) => {
    table.dropColumn("gross_hours");
    table.dropColumn("effective_hours");
  });
};
