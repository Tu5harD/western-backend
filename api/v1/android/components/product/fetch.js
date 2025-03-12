const { Op, Sequelize } = require("sequelize");
const Stock = require("../../../../../model/stock/stock");
const Product = require("../../../../../model/product/product");
const Vendor = require("../../../../../model/vendor/vendor");
const Category = require("../../../../../model/category/category");
const { globalError } = require("../../../../../errors/globalError");

const getAllAndroidProducts = async (req, res, next) => {
  try {
    const condition = {
      [Op.and]: [
        { stock_deleted: false },
        { stock_status: { [Op.between]: ["instock", "limitedstock"] } },
      ],
    };

    const stock = await Stock.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Product,
          attributes: [
            "product_name",
            "product_id",
            "category_id",
            "product_base_unit",
            "product_secondary_unit",
            "product_conversion_rate",
            "product_current_stock",
          ],
          include: [
            {
              model: Category,
              attributes: ["category_name"],
            },
          ],
        },
        {
          model: Vendor,
          attributes: ["vendor_name", "vendor_id"],
        },
      ],
    });
    if (stock?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Stock not Created",
      });
    }
    const data = stock?.rows.map((obj) => {
      const { stock_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: stock.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllAndroidProducts,
};
