const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Retailer = require("../retailer/retailer");

const Ledger = sequelize.define(
  "Ledger",
  {
    ledger_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    retailer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("credit", "debit"),
      validate: {
        isInEnum(value) {
          if (!["credit", "debit"].includes(value)) {
            throw new Error("Invalid type");
          }
        },
      },
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "ledger",
  }
);
Ledger.belongsTo(Retailer, { foreignKey: "retailer_id" });

Ledger.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Ledger;
