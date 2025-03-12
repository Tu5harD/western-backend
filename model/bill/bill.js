const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Order = require("../order/order");
const Retailer = require("../retailer/retailer");
const Bill = sequelize.define(
  "Bill",
  {
    bill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
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
    items: {
      type: DataTypes.TEXT("medium"),
      allowNull: true,
      defaultValue: null,
    },
    pending_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    bill_status: {
      type: DataTypes.ENUM("paid", "pending", "rejected", "cancel"),
      validate: {
        isInEnum(value) {
          if (!["paid", "pending", "rejected", "cancel"].includes(value)) {
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
    tableName: "bill",
  }
);
Order.hasOne(Bill, { foreignKey: "order_id" });
Bill.belongsTo(Order, { foreignKey: "order_id" });
Bill.belongsTo(Retailer, { foreignKey: "retailer_id" });

Bill.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Bill;
