exports.up = function (knex) {
  return knex.schema.alterTable("leave_applications", (table) => {
    // Drop the old, single span column
    table.dropColumn("day_span");

    // Add new, more flexible columns
    table.string("start_day_span").notNullable().defaultTo("FullDay"); // FullDay, FirstHalf, SecondHalf
    table.string("end_day_span").notNullable().defaultTo("FullDay");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("leave_applications", (table) => {
    table.dropColumn("start_day_span");
    table.dropColumn("end_day_span");
    table.string("day_span").notNullable().defaultTo("FullDay");
  });
};
