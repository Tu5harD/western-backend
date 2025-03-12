const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Vendor = sequelize.define(
  "Vendor",
  {
    vendor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vendor_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vendor_mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    vendor_address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value === "" || value === null) {
          this.setDataValue("vendor_address", null);
        } else this.setDataValue("vendor_address", value);
      },
    },

    vendor_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    vendor_fssai: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_gst_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_gst_type: {
      type: DataTypes.ENUM("regular", "composite", "un-regular"),
      allowNull: false,
      validate: {
        isInEnum(value) {
          if (!["regular", "composite", "un-regular"].includes(value)) {
            throw new Error("Invalid GST type");
          }
        },
      },
      defaultValue: "un-regular",
    },
    vendor_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "vendors",
  }
);

Vendor.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Vendor;
