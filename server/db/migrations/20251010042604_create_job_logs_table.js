exports.up = function (knex) {
  return knex.schema.createTable("job_logs", (table) => {
    table.increments("id").primary();
    table.string("job_name").notNullable();
    table.timestamp("start_time").defaultTo(knex.fn.now());
    table.timestamp("end_time");
    table.string("status").notNullable(); // 'Running', 'Success', 'Failed'
    table.text("details");
  });
};
exports.down = function (_knex) {
  /* ... */
};
