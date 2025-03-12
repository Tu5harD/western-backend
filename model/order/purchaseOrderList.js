const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const PurchaseOrder = require("./purchaseOrder");
const Product = require("../product/product");
const PurchaseOrderList = sequelize.define(
  "PurchaseOrderList",
  {
    purchase_order_list_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    purchase_order_id: {
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
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gst_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "purchaseorderlist",
  }
);

PurchaseOrder.hasMany(PurchaseOrderList, {
  foreignKey: "purchase_order_id",
});
PurchaseOrderList.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id" });
PurchaseOrderList.belongsTo(Product, { foreignKey: "product_id" });

PurchaseOrderList.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = PurchaseOrderList;
