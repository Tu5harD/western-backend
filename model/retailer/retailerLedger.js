const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../../config/database");

const RetailerLedger = sequelize.define(
  "RetailerLedger",
  {
    retailer_ledger_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    retailer_ledger_amount: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
      defaultValue: 0,
    },
    retailer_ledger_payment_receiving_type: {
      type: DataTypes.ENUM("Cash", "GPay", "PhonePe", "PayTm"),
      allowNull: false,
      validate: {
        isInEnum(value) {
          if (!["Cash", "GPay", "PhonePe", "PayTm"].includes(value)) {
            throw new Error("Invalid Payment type");
          }
        },
      },
      defaultValue: "Cash",
    },
    retailer_ledger_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    retailer_ledger_added_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    retailer_ledger_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "retailer_ledger",
    indexes: [],
  }
);

RetailerLedger.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = RetailerLedger;
