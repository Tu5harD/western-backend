const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { toLowerCase } = require("../helper/utils/toLowerCase");
const { trimSpace } = require("../helper/utils/trimSpace");

const Admin = sequelize.define(
  "Admin",
  {
    admin_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    admin_mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    admin_address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value === "" || value === null) {
          this.setDataValue("admin_address", null);
        } else
          this.setDataValue("admin_address", trimSpace(toLowerCase(value)));
      },
    },
    admin_gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
      validate: {
        isInEnum(value) {
          if (!["male", "female", "other"].includes(value)) {
            throw new Error("Invalid gender");
          }
        },
      },
    },
    admin_email: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        if (value === "" || value === null) {
          this.setDataValue("admin_email", null);
        } else
          this.setDataValue(
            "admin_email",
            trimSpace(toLowerCase(value)).trim().split(" ").join("")
          );
      },
    },
    admin_added_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    admin_added_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admin_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "admins",
  }
);

Admin.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Admin;
