const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Route = sequelize.define(
  "Route",
  {
    route_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    route_from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "routes",
  }
);

Route.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Route;
