const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Order = require("./order");
const Product = require("../product/product");

const OrderList = sequelize.define(
  "OrderList",
  {
    order_list_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    free_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gst_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "orderlist",
  }
);

Order.hasMany(OrderList, {
  foreignKey: "order_id",
});

OrderList.belongsTo(Order, { foreignKey: "order_id" });
OrderList.belongsTo(Product, { foreignKey: "product_id" });

OrderList.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = OrderList;
