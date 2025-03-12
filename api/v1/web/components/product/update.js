const { globalError } = require("../../../../../errors/globalError");
const Product = require("../../../../../model/product/product");

const updateProductDetailsByProductId = async (req, res, next) => {
  try {
    const {
      vendor_id,
      category_id,
      product_name,
      product_hsn_code,
      product_img = "",
      product_base_unit,
      product_secondary_unit,
      product_conversion_rate,
      product_tax_rate,
      product_default_mrp,
      product_wholesaler_price,
      product_retailer_price,
      product_discount_type,
      product_discount,
      product_id,
    } = req.body;

    const value = {
      vendor_id,
      category_id,
      product_name,
      product_hsn_code,
      product_img,
      product_base_unit,
      product_secondary_unit,
      product_conversion_rate,
      product_tax_rate,
      product_default_mrp,
      product_wholesaler_price,
      product_retailer_price,
      product_discount_type,
      product_discount,
    };

    const product = await Product.update(value, {
      where: {
        product_id,
      },
    });

    if (product[0] === 0) {
      return next(globalError(404, "Product not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Product successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateProductDetailsByProductId };
