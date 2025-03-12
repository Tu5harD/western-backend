const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Route = require("../routePath/route");

const Village = sequelize.define(
  "Village",
  {
    village_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    village_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    village_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "village",
  }
);

Village.belongsTo(Route, { foreignKey: "route_id" });

Village.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Village;
