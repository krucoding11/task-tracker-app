// src/config/db.js
const knex = require("knex");
const knexfile = require("./knexfile.js");

// In a real app, you would use a variable to select 'development' or 'production'
const db = knex(knexfile.development);

module.exports = db;
