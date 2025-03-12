const Product = require("../../../model/product/product");
const { globalError } = require("../../../errors/globalError");

const isBarCodeAlreadyExists = async (req, res, next) => {
  try {
    const { generate_bar_code, bar_code, product_code_type } = req.body;

    const found = await Product.findOne({
      where: {
        bar_code: product_code_type === 0 ? bar_code : generate_bar_code,
      },
    });

    if (!found) {
      return next();
    } else {
      return next(globalError(500, "Bar Code Already Exists"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isBarCodeAlreadyExists };
