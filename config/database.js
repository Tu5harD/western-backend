const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

// const host = process.env.HOST;
// const username = process.env.USER;
// const password = process.env.PASSWORD;
// const database = process.env.DATABASE;
const databaseType = process.env.DATABASE_TYPE;

const host ="103.191.209.34"
const username="ubzrnkmd_western_admin"
const password="Zm~Bl?l~Vu^&"
const database ="ubzrnkmd_western"


// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: databaseType,
  logging: false,
});

module.exports = { Sequelize, sequelize };
