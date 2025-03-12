const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Worker = require("./worker");
const WorkerAttedance = sequelize.define(
  "WorkerAttendance",
  {
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    worker_attendance_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    worker_attended: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "worker_attendance",
  }
);

WorkerAttedance.belongsTo(Worker, { foreignKey: "worker_id" });

WorkerAttedance.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = WorkerAttedance;
