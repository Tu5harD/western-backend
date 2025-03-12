const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Executive = sequelize.define(
  "Executive",
  {
    executive_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    executive_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    executive_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    executive_mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    executive_address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value === "" || value === null) {
          this.setDataValue("executive_address", null);
        } else this.setDataValue("executive_address", value);
      },
    },
    executive_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    executive_gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
      validate: {
        isInEnum(value) {
          if (!["male", "female", "other"].includes(value)) {
            throw new Error("Invalid Gender type");
          }
        },
      },
    },
    executive_target: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: true,
    },
    executive_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "executives",
  }
);

Executive.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Executive;
