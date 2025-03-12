const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Vendor = require("../vendor/vendor");
const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    purchase_order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_order_confirm_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purchase_order_status: {
      type: DataTypes.ENUM("confirmed", "pending", "rejected"),
      validate: {
        isInEnum(value) {
          if (!["confirmed", "pending", "rejected"].includes(value)) {
            throw new Error("Invalid status type");
          }
        },
      },
      allowNull: false,
      defaultValue: "pending",
    },
    purchase_order_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "purchaseorders",
  }
);
PurchaseOrder.belongsTo(Vendor, { foreignKey: "vendor_id" });

PurchaseOrder.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = PurchaseOrder;
