const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const PurchaseOrder = require("../order/purchaseOrder");
const Vendor = require("../vendor/vendor");
const PurchaseBill = sequelize.define(
  "PurchaseBill",
  {
    purchase_bill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sub_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    billing_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    pending_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    purchase_bill_status: {
      type: DataTypes.ENUM("paid", "pending", "rejected"),
      validate: {
        isInEnum(value) {
          if (!["paid", "pending", "rejected"].includes(value)) {
            throw new Error("Invalid status type");
          }
        },
      },
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "purchasebill",
  }
);
PurchaseOrder.hasOne(PurchaseBill, { foreignKey: "purchase_order_id" });
PurchaseBill.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id" });
PurchaseBill.belongsTo(Vendor, { foreignKey: "vendor_id" });

PurchaseBill.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = PurchaseBill;
