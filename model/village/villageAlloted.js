const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Village = require("../village/village");
const Executive = require("../executive/executive");

const VillageAlloted = sequelize.define(
  "VillageAlloted",
  {
    village_alloted_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    village_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    executive_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "villagealloted",
  }
);

VillageAlloted.belongsTo(Executive, { foreignKey: "executive_id" });
VillageAlloted.belongsTo(Village, { foreignKey: "village_id" });

VillageAlloted.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = VillageAlloted;
