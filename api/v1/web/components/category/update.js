const { globalError } = require("../../../../../errors/globalError");
const Category = require("../../../../../model/category/category");

const updateCategoryByCategoryId = async (req, res, next) => {
  try {
    const { category_name, category_id } = req.body;

    const value = {
      category_name,
    };

    const category = await Category.update(value, {
      where: {
        category_id,
      },
    });

    if (category[0] === 0) {
      return next(globalError(404, "Category not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Category successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateCategoryByCategoryId };
