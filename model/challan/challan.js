const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Retailer = require("../retailer/retailer");
const Challan = sequelize.define(
  "Challan",
  {
    challan_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    challan_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    transporter_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vehicle_no: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    freight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    packaging: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    challan_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "challan",
  }
);
Challan.belongsTo(Retailer, { foreignKey: "retailer_id" });

Challan.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Challan;
