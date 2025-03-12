const { globalError } = require("../../../../../errors/globalError");
const Category = require("../../../../../model/category/category");

const newCategoryRegistration = async (req, res, next) => {
  try {
    const { category_name } = req.body;
    const value = {
      category_name: category_name.toLowerCase(),
    };
    const category = await Category.create(value);
    if (!category) {
      return next(globalError(500, "Something went wrong"));
    }
    await category.save();
    const { ...createdCategory } = category.toJSON();
    return res.status(201).json({
      success: true,
      data: createdCategory,
      message: `Category successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newCategoryRegistration };
