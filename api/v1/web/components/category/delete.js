const { globalError } = require("../../../../../errors/globalError");
const Category = require("../../../../../model/category/category");

const deleteCategoryByCategoryId = async (req, res, next) => {
  try {
    const { category_id } = req.body;
    const value = {
      category_deleted: true,
    };
    const deletedCategory = await Category.update(value, {
      where: {
        category_id,
      },
    });
    if (deletedCategory[0] === 0) {
      return next(globalError(404, "Category not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Category successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteCategoryByCategoryId };
