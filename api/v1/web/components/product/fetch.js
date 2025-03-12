const { Op } = require("sequelize");
const Category = require("../../../../../model/category/category");
const Product = require("../../../../../model/product/product");
const Stock = require("../../../../../model/stock/stock");
const Vendor = require("../../../../../model/vendor/vendor");
const { globalError } = require("../../../../../errors/globalError");

const getAllProducts = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    const condition = {
      [Op.and]: [{ product_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ product_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            product_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const product = await Product.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Category,
          attributes: ["category_name", "category_id"],
        },
      ],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (product?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "product not Created",
      });
    }
    const data = product?.rows.map((obj) => {
      const { eproduct_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: product.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllProductsAsOptions = async (req, res, next) => {
  try {
    const { category_id } = req.body;

    const stock = await Product.findAll({
      where: {
        product_deleted: false,
      },
    });
    if (!stock || stock.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for the specified category.",
      });
    }

    return res.status(200).json({ success: true, data: stock });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllProductsAsOptionsByCategoryIdStock = async (req, res, next) => {
  try {
    const { category_id } = req.body;

    const product = await Product.findAndCountAll({
      where: {
        category_id: category_id,
        product_deleted: false,
      },
    });
    if (product?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Product not Created",
      });
    }
    const data = product?.rows.map((obj) => {
      const { product_name, product_id } = obj.toJSON();
      return { label: product_name, value: product_id };
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllProductsByVendorId = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.body;
    const condition = {
      [Op.and]: [{ product_deleted: false }],
    };
    const vendorId = req.params.id;

    const product = await Product.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Category,
          attributes: ["category_name", "category_id"],
        },
        {
          model: Vendor,
          attributes: ["vendor_name", "vendor_id"],
          where: {
            vendor_id: vendorId,
          },
        },
      ],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (product?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "product not Created",
      });
    }
    const data = product?.rows.map((obj) => {
      const { eproduct_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: product.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllProducts,
  getAllProductsAsOptions,
  getAllProductsAsOptionsByCategoryIdStock,
  getAllProductsByVendorId,
};
