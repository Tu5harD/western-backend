const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Worker = sequelize.define(
  "Worker",
  {
    worker_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    worker_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    worker_mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    worker_address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value === "" || value === null) {
          this.setDataValue("worker_address", null);
        } else this.setDataValue("worker_address", value);
      },
    },

    worker_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    worker_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "workers",
  }
);

Worker.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Worker;
