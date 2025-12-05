exports.up = function (knex) {
  return knex.schema
    .alterTable("attendance", (table) => {
      table.dropUnique(["employee_id", "attendance_date"]);

      table.dropColumn("attendance_date");
      table.dropColumn("check_in_time");
      table.dropColumn("check_out_time");
    })
    .then(() => {
      return knex.schema.alterTable("attendance", (table) => {
        table.timestamp("check_in_time", { useTz: true });
        table.timestamp("check_out_time", { useTz: true });
        table.string("log_method").defaultTo("Biometric").notNullable();
        table.string("ip_address").nullable();

        table.specificType(
          "attendance_date",
          "DATE GENERATED ALWAYS AS (CAST(check_in_time AT TIME ZONE 'UTC' AS date)) STORED",
        );

        table.unique(["employee_id", "attendance_date"]);
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("attendance", (table) => {
      table.dropUnique(["employee_id", "attendance_date"]);
      table.dropColumn("check_in_time");
      table.dropColumn("check_out_time");
      table.dropColumn("attendance_date");
      table.dropColumn("ip_address");
    })
    .then(() => {
      // Re-add the old, original columns
      return knex.schema.alterTable("attendance", (table) => {
        table.date("attendance_date").notNullable();
        table.time("check_in_time");
        table.time("check_out_time");
      });
    });
};
