const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const BillSelected = sequelize.define(
  "BillSelected",
  {
    bill_selected_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bill_selected: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "billselected",
  }
);

BillSelected.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = BillSelected;
