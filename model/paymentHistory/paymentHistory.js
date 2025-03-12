const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Retailer = require("../retailer/retailer");
const Order = require("../order/order");
const Bill = require("../bill/bill");
const PaymentHistory = sequelize.define(
  "PaymentHistory",
  {
    history_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    history_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "paymenthistorys",
  }
);
PaymentHistory.belongsTo(Retailer, { foreignKey: "retailer_id" });
PaymentHistory.belongsTo(Order, { foreignKey: "order_id" });
PaymentHistory.belongsTo(Bill, { foreignKey: "order_id" });

PaymentHistory.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = PaymentHistory;
