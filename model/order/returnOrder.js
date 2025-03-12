const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Retailer = require("../retailer/retailer");
const ReturnOrder = sequelize.define(
  "ReturnOrder",
  {
    return_order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    return_order_confirm_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    return_order_status: {
      type: DataTypes.ENUM("confirmed", "pending", "rejected"),
      validate: {
        isInEnum(value) {
          if (!["confirmed", "pending", "rejected"].includes(value)) {
            throw new Error("Invalid status type");
          }
        },
      },
      allowNull: false,
      defaultValue: "pending",
    },
    return_order_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "returnorders",
  }
);
ReturnOrder.belongsTo(Retailer, { foreignKey: "retailer_id" });

ReturnOrder.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = ReturnOrder;
