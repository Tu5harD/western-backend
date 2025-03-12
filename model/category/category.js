const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Category = sequelize.define(
  "Category",
  {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_img: {
      type: DataTypes.TEXT("medium"),
      defaultValue: "",
    },
    category_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "category",
  }
);

Category.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Category;
