const { globalError } = require("../../../../../errors/globalError");
const Product = require("../../../../../model/product/product");

const deleteProductByProductId = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const value = {
      product_deleted: true,
    };
    const deletedProduct = await Product.update(value, {
      where: {
        product_id,
      },
    });
    if (deletedProduct[0] === 0) {
      return next(globalError(404, "Product not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Product successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteProductByProductId };
