const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const ReturnOrder = require("./returnOrder");
const Product = require("../product/product");
const ReturnOrderList = sequelize.define(
  "ReturnOrderList",
  {
    return_order_list_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    return_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gst_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    return_type: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "returnorderlist",
  }
);

ReturnOrder.hasMany(ReturnOrderList, {
  foreignKey: "return_order_id",
});
ReturnOrderList.belongsTo(ReturnOrder, { foreignKey: "return_order_id" });
ReturnOrderList.belongsTo(Product, { foreignKey: "product_id" });

ReturnOrderList.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = ReturnOrderList;
