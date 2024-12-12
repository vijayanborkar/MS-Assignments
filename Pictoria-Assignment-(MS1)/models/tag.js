const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const tag = sequelize.define("tag", {
  name: DataTypes.STRING,
  photoId: {
    type: DataTypes.INTEGER,
    references: { model: "photos", key: "id" },
  },
});

module.exports = tag;
