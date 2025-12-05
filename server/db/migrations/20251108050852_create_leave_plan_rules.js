// <timestamp>_create_leave_plan_rules.js

exports.up = function (knex) {
  return knex.schema.createTable("leave_plan_rules", (table) => {
    table.increments("id").primary();
    table
      .integer("leave_plan_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("leave_plans")
      .onDelete("CASCADE");
    table
      .integer("leave_type_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("leave_types")
      .onDelete("CASCADE");

    // --- Ticket 2: Accrual Logic ---
    table
      .enu("accrual_frequency", [
        "monthly",
        "quarterly",
        "half_yearly",
        "yearly",
      ])
      .defaultTo("monthly");
    table.integer("accrual_day").defaultTo(1); // 1st of the month
    table.decimal("accrual_amount", 4, 2).defaultTo(0);
    table.boolean("is_quota_unlimited").defaultTo(false);
    table.boolean("allow_negative_balance").defaultTo(false);
    table.decimal("max_negative_balance", 4, 2).defaultTo(0);

    // --- Ticket 3 & 4: Application Rules ---
    table.boolean("allow_half_day").defaultTo(false);
    table.boolean("allow_quarter_day").defaultTo(false);
    table.boolean("require_comment").defaultTo(true);
    table.boolean("allow_backdated_application").defaultTo(false);
    table.integer("backdated_days_limit").defaultTo(0);
    table.integer("min_days_from_joining").defaultTo(0);
    table.integer("require_attachment_after_days").defaultTo(0); // 0 = never

    // --- Ticket 5: Usage Limits ---
    table.integer("max_consecutive_days");
    table.integer("max_days_per_month");
    table.integer("min_gap_between_leaves"); // in days

    // --- Ticket 9: Probation Rules ---
    table.boolean("is_active_during_probation").defaultTo(false);
    table.integer("probation_max_days").defaultTo(0);

    // --- Ticket 10: Notice Period Rules ---
    table.boolean("is_active_during_notice").defaultTo(false);
    table.boolean("notice_allow_encashment").defaultTo(false);

    // --- Ticket 8: Year-End Processing ---
    table
      .enu("year_end_processing", ["carry_forward", "expire", "encash"])
      .defaultTo("expire");
    table.decimal("carry_forward_limit", 4, 2);

    // Ensure one plan can't have two rules for the same leave type
    table.unique(["leave_plan_id", "leave_type_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("leave_plan_rules");
};
