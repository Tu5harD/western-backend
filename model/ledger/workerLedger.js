const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Worker = require("../worker/worker");

const WorkerLedger = sequelize.define(
  "WorkerLedger",
  {
    worker_ledger_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    worker_id: {
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
    tableName: "workerledger",
  }
);
WorkerLedger.belongsTo(Worker, { foreignKey: "worker_id" });

WorkerLedger.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = WorkerLedger;
