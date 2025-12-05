// <timestamp>_alter_leave_types_add_category.js

exports.up = function (knex) {
  return knex.schema
    .alterTable("leave_types", (table) => {
      table.dropColumn("is_paid");
      table.dropColumn("default_days_per_year");
    })
    .then(() => {
      return knex.schema.alterTable("leave_types", (table) => {
        table
          .enu("category", ["Regular", "Unpaid", "Compensatory", "Incident"])
          .defaultTo("Regular")
          .notNullable();

        // This 'is_paid' field is now controlled by the leave type itself
        table.boolean("is_paid").defaultTo(true).notNullable();
      });
    });
};

exports.down = function (knex) {
  return knex.schema.table("leave_types", (table) => {
    table.dropColumn("category");
    table.dropColumn("is_paid");
  });
};
