exports.up = function (knex) {
  return knex.schema
    .alterTable("shifts", (table) => {
      table.integer("grace_period_minutes").notNullable().defaultTo(30); // e.g., 30 minutes grace
    })
    .alterTable("attendance", (table) => {
      table.integer("late_by_minutes").nullable();
    });
};

exports.down = function (_knex) {
  /* ... */
};
