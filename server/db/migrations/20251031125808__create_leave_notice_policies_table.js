// <timestamp>_create_flexible_leave_policies.js

exports.up = function (knex) {
  return knex.schema.createTable("leave_notice_policies", function (table) {
    table.increments("id").primary();

    table
      .integer("leave_type_id")
      .unsigned()
      .references("id")
      .inTable("leave_types")
      .onDelete("SET NULL") // Becomes a global rule if type is deleted
      .nullable(); // null = Global policy for all types

    // This is the key: 'DURATION' (e.g., 2 days) or 'SAME_DAY' (e.g., Early Leave)
    table.string("policy_type").notNullable();

    // --- For DURATION policies ---
    table.integer("min_duration").nullable(); // e.g., 4 (for "4+ days")
    table.integer("max_duration").nullable(); // e.g., 4 (for "2-4 days")
    table.integer("notice_days").nullable(); // e.g., 15

    // --- For SAME_DAY policies ---
    // Stores the cutoff time (e.g., '12:00:00')
    table.time("apply_before_time").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("leave_notice_policies");
};
