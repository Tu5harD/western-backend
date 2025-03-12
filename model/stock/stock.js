const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Product = require("../product/product");

const Stock = sequelize.define(
  "Stock",
  {
    stock_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    loose_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    minimum_stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "stocks",
  }
);
Stock.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(Stock, { foreignKey: "product_id" });

Stock.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Stock;
