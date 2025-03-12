const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Bill = require("../bill/bill");

const OrderPayments = sequelize.define(
  "OrderPayments", // Corrected the model name
  {
    payment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "upi", "card"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "order_payments",
    timestamps: false,
  }
);
OrderPayments.belongsTo(Bill, { foreignKey: "bill_id" });

OrderPayments.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = OrderPayments;
