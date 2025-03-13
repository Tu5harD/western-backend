const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Order = require("./order");

const SpareOrderList = sequelize.define(
  "SpareOrderList",
  {
    spare_order_list_id: {
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
    part_name: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: "spareorderlist",
  }
);

Order.hasMany(SpareOrderList, {
  foreignKey: "order_id",
});

SpareOrderList.belongsTo(Order, { foreignKey: "order_id" });

SpareOrderList.sync({ alter: true })
  .then(() => {})
  .catch((error) => {});

module.exports = SpareOrderList;
