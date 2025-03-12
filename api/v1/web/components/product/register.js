const { globalError } = require("../../../../../errors/globalError");
const Product = require("../../../../../model/product/product");
const { sequelize } = require("../../../../../config/database");

const newProductRegistration = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      category_id,
      product_name,
      product_hsn_code,
      product_img = "",
      product_base_unit,
      product_secondary_unit,
      product_conversion_rate,
      product_tax_rate,
      product_default_mrp,
      product_expiry_date,
      product_wholesaler_price,
      product_retailer_price,
      product_purchase_price,
      product_discount_type,
      product_discount,
    } = req.body;
    const value = {
      category_id,
      product_name,
      product_hsn_code,
      product_img,
      product_base_unit,
      product_secondary_unit,
      product_conversion_rate,
      product_tax_rate,
      product_default_mrp,
      product_expiry_date,
      product_wholesaler_price,
      product_retailer_price,
      product_purchase_price,
      product_discount_type,
      product_discount,
    };
    const product = await Product.create(value, { transaction: t });
    if (!product) {
      await t.rollback();
      return next(globalError(500, "Something went wrong"));
    }
    req.Product = product.toJSON();
    req.t = t;
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

module.exports = { newProductRegistration };
