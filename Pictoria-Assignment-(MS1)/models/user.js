const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const user = sequelize.define("user", {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
});

module.exports = user;
