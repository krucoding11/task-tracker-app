exports.up = function (knex) {
  return (
    knex.schema
      // 1. Create the 'roles' table
      .createTable("roles", (table) => {
        table.increments("id").primary();
        table.string("name").notNullable().unique();
        table.text("description");
      })
      // 2. Create the 'permissions' table
      .createTable("permissions", (table) => {
        table.increments("id").primary();
        table.string("action").notNullable().unique(); // e.g., 'employee:create', 'payroll:run'
        table.text("description");
      })
      // 3. Create the 'role_permissions' junction table
      .createTable("role_permissions", (table) => {
        table
          .integer("role_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("roles")
          .onDelete("CASCADE");
        table
          .integer("permission_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("permissions")
          .onDelete("CASCADE");
        // Set a composite primary key
        table.primary(["role_id", "permission_id"]);
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("role_permissions")
    .dropTableIfExists("permissions")
    .dropTableIfExists("roles");
};
