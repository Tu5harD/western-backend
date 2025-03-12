const { Op, Model } = require("sequelize");
const Vendor = require("../../../../../model/vendor/vendor");
const Product = require("../../../../../model/product/product");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const getAllVendor = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status } = req.query;
    const condition = {
      [Op.and]: [{ vendor_deleted: false }],
    };

    if (status === "true" || status === "false") {
      condition.vendor_status = status;
    }

    if (query.startsWith("#")) {
      condition[Op.and].push({ vendor_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            vendor_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const vendor = await Vendor.findAndCountAll({
      where: {
        ...condition,
      },
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (vendor?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Vendor not Created",
      });
    }
    const data = vendor?.rows.map((obj) => {
      const { password, vendor_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: vendor.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllVendorAsOptions = async (req, res, next) => {
  try {
    const vendor = await Vendor.findAndCountAll({
      where: {
        vendor_deleted: false,
      },
    });
    if (vendor?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "vendor not Created",
      });
    }
    const data = vendor?.rows.map((obj) => {
      const { vendor_name, vendor_id } = obj.toJSON();
      return { label: vendor_name, value: vendor_id };
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllVendorWithoutPaginated = async (req, res, next) => {
  try {
    const condition = {
      [Op.and]: [{ vendor_deleted: false }],
    };

    const vendor = await Vendor.findAndCountAll({
      where: { ...condition },
    });
    if (vendor?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Vendor not created",
      });
    }
    const data = vendor?.rows.map((obj) => {
      const { vendor_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getVendorById = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    const condition = {
      [Op.and]: [{ vendor_deleted: false }],
    };

    const vendor = await Vendor.findOne({
      where: { ...condition, vendor_id: vendor_id },
    });
    if (!vendor) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Vendor not created",
      });
    }

    return res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getVendorProductsById = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    const condition = {
      [Op.and]: [{ product_deleted: false }],
    };

    const product = await Product.findAndCountAll({
      where: { ...condition, vendor_id: vendor_id },
      attributes: [
        "product_id",
        "product_img",
        "createdAt",
        "product_current_stock",
      ],
      include: [
        {
          model: Category,
          attributes: ["category_name"],
        },
        {
          model: Vendor,
          attributes: ["vendor_name"],
        },
      ],
    });
    if (product.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Product not Added by this vendor ",
      });
    }
    let data = product.rows?.map((m) => {
      const { product_deleted, ...otherData } = m.toJSON();
      return otherData;
    });

    return res
      .status(200)
      .json({ success: true, data: data, total: product.count });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllVendor,
  getAllVendorAsOptions,
  getAllVendorWithoutPaginated,
  getVendorById,
  getVendorProductsById,
};
