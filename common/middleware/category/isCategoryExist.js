const { globalError } = require("../../../errors/globalError");
const Category = require("../../../model/category/category");

const isCategoryExistsById = async (req, res, next) => {
  try {
    const { category_name, vendor_id } = req.body;
    const isCategoryExist = await Category.findOne({
      where: {
        category_name: category_name.toLowerCase(),
        vendor_id: vendor_id,
      },
    });
    if (isCategoryExist) {
      return next(globalError(406, `Category ${category_name} already exist`));
    }
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isCategoryExistsById };
