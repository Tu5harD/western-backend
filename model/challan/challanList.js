const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Challan = require("./challan");
const Product = require("../product/product");
const Stock = require("../stock/stock");
const ChallanList = sequelize.define(
  "ChallanList",
  {
    challan_list_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    challan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "challanlist",
  }
);

Challan.hasMany(ChallanList, {
  foreignKey: "challan_id",
});
ChallanList.belongsTo(Challan, { foreignKey: "challan_id" });
ChallanList.belongsTo(Product, { foreignKey: "product_id" });
ChallanList.belongsTo(Stock, { foreignKey: "stock_id" });

ChallanList.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = ChallanList;
