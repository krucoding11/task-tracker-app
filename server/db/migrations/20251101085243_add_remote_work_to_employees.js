// <timestamp>_add_remote_work_to_employees.js

exports.up = function (knex) {
  return knex.schema.table("employees", (table) => {
    table.string("work_setting").defaultTo("In-Office").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table("employees", (table) => {
    table.dropColumn("work_setting");
  });
};
