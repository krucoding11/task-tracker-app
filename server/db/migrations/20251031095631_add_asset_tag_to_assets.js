exports.up = function (knex) {
  return knex.schema.alterTable("assets", (table) => {
    table.string("asset_tag").notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("assets", (table) => {
    table.dropColumn("asset_tag");
  });
};
