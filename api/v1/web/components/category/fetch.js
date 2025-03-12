const { Op } = require("sequelize");
const Category = require("../../../../../model/category/category");
const Vendor = require("../../../../../model/vendor/vendor");
const { globalError } = require("../../../../../errors/globalError");

const getAllCategoryAsOptions = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;

    const category = await Category.findAndCountAll({
      where: {
        vendor_id: vendor_id,
      },
    });
    if (category?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "category not Created",
      });
    }
    const data = category?.rows.map((obj) => {
      const { category_name, category_id } = obj.toJSON();
      return { label: category_name, value: category_id };
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllCategoryByVendorId = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    const category = await Category.findAll({
      where: { vendor_id: vendor_id },
    });
    if (!category || category.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "No categories created",
      });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllCategory = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status } = req.query;
    const condition = {
      [Op.and]: [{ category_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ category_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            category_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const categories = await Category.findAndCountAll({
      where: {
        ...condition,
      },
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (categories?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Category not created",
      });
    }
    const data = categories?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });
    return res
      .status(200)
      .json({ success: true, total: categories.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllCategoryAsOptions,
  getAllCategoryByVendorId,
  getAllCategory,
};
