/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("employees", (table) => {
      table.string("profile_picture_url");
    })
    .alterTable("announcements", (table) => {
      table.string("image_url");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (_knex) {};
