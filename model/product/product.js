const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Category = require("../category/category");

const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_img: {
      type: DataTypes.TEXT("medium"),
      defaultValue: "",
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_hsn_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_base_unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_secondary_unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_conversion_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    product_tax_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    product_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    product_default_mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    product_wholesaler_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    product_retailer_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    product_discount_type: {
      type: DataTypes.ENUM("amount", "percentage"),
      validate: {
        isInEnum(value) {
          if (!["amount", "percentage"].includes(value)) {
            throw new Error("Invalid Discount type");
          }
        },
      },
      allowNull: false,
    },
    product_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    product_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [],
    tableName: "products",
  }
);

Product.belongsTo(Category, { foreignKey: "category_id" });

Product.sync({ alter: false })
  .then(() => {})
  .catch((error) => {});

module.exports = Product;
