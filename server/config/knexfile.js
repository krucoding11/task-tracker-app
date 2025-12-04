// knexfile.js
require("dotenv").config({ path: "./.env" });
const { types } = require("pg");
types.setTypeParser(1082, (val) => val);
console.log(
  "process.env.DB_PASSWORD............",
  typeof process.env.DB_PASSWORD,
);
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "tasktracker",
      port: process.env.DB_PORT || "5432",
      timezone: "UTC",
    },
    migrations: {
      directory: "../db/migrations",
    },
    seeds: {
      directory: "../db/seeds",
    },
  },
};
