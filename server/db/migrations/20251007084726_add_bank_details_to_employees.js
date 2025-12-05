exports.up = function (knex) {
  return knex.schema.alterTable("employees", (table) => {
    table.string("bank_name");
    table.string("branch_name");
    table.string("account_number");
    table.string("ifsc_code");
    table.string("account_holder_name");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("employees", (table) => {
    table.dropColumn("bank_name");
    table.dropColumn("branch_name");
    table.dropColumn("account_number");
    table.dropColumn("ifsc_code");
    table.dropColumn("account_holder_name");
  });
};
