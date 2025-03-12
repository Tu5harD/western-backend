const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Route = require("../routePath/route");
const Village = require("../village/village");

const Retailer = sequelize.define(
  "Retailer",
  {
    retailer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    retailer_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    retailer_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    retailer_mobile: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    retailer_address: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value === "" || value === null) {
          this.setDataValue("retailer_address", null);
        } else this.setDataValue("retailer_address", value);
      },
    },
    retailer_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    village_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    retailer_fssai: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    retailer_gst_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    retailer_gst_type: {
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
    type: {
      type: DataTypes.ENUM("retailer", "wholesaler"),
      allowNull: false,
      validate: {
        isInEnum(value) {
          if (!["retailer", "wholesaler"].includes(value)) {
            throw new Error("Invalid type");
          }
        },
      },
      defaultValue: "retailer",
    },
    last_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retailer_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retailer_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "retailers",
  }
);

Retailer.belongsTo(Route, { foreignKey: "route_id" });
Retailer.belongsTo(Village, { foreignKey: "village_id" });

Retailer.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Retailer;
