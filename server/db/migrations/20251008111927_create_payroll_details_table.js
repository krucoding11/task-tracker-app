exports.up = function (knex) {
  return knex.schema.createTable("payroll_details", (table) => {
    table.increments("id").primary();
    table
      .integer("payroll_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("payrolls")
      .onDelete("CASCADE");
    table.string("component_name").notNullable();
    table.string("component_type").notNullable(); // 'Earning' or 'Deduction'
    table.decimal("amount", 12, 2).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("payroll_details");
};
