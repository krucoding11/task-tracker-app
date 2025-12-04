/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("attendance_logs", function (table) {
      table.dropColumn("punch_time");
    })
    .then(() => {
      return knex.schema.alterTable("attendance_logs", function (table) {
        table.timestamp("punch_time", { useTz: true });
        table.unique(["employee_id", "punch_time"]);
        table.string("source").defaultTo("Biometric");
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("attendance_logs", function (table) {
    table.dropColumn("punch_time");
    table.dropColumn("source");
  });
};
