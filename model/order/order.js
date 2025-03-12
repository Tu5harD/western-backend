const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Retailer = require("../retailer/retailer");
const Order = sequelize.define(
  "Order",
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_added_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_added_by: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order_confirm_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    order_status: {
      type: DataTypes.ENUM("confirmed", "pending", "rejected", "cancel"),
      validate: {
        isInEnum(value) {
          if (!["confirmed", "pending", "rejected", "cancel"].includes(value)) {
            throw new Error("Invalid status type");
          }
        },
      },
      allowNull: false,
      defaultValue: "pending",
    },
    order_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "orders",
  }
);
Order.belongsTo(Retailer, { foreignKey: "retailer_id" });

Order.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Order;
