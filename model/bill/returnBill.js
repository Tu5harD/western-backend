const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const ReturnOrder = require("../order/returnOrder");
const Retailer = require("../retailer/retailer");
const ReturnBill = sequelize.define(
  "ReturnBill",
  {
    return_bill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    return_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sub_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    billing_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    pending_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    return_bill_status: {
      type: DataTypes.ENUM("paid", "pending", "rejected"),
      validate: {
        isInEnum(value) {
          if (!["paid", "pending", "rejected"].includes(value)) {
            throw new Error("Invalid status type");
          }
        },
      },
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "returnbill",
  }
);
ReturnOrder.hasOne(ReturnBill, { foreignKey: "return_order_id" });
ReturnBill.belongsTo(ReturnOrder, { foreignKey: "return_order_id" });
ReturnBill.hasMany(Retailer, { foreignKey: "retailer_id" });

ReturnBill.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = ReturnBill;
