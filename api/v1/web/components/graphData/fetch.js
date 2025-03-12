const { Op } = require("sequelize");
const Bill = require("../../../../../model/bill/bill");
const Order = require("../../../../../model/order/order");
const OrderList = require("../../../../../model/order/orderList");
const Retailer = require("../../../../../model/retailer/retailer");
const Product = require("../../../../../model/product/product");
const Stock = require("../../../../../model/stock/stock");
const { Sequelize, sequelize } = require("../../../../../config/database");
const dayjs = require("dayjs");
const { globalError } = require("../../../../../errors/globalError");
const PurchaseOrderList = require("../../../../../model/order/purchaseOrderList");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");

const productYearlySold = async (req, res, next) => {
  try {
    const { product_id } = req.body;

    const currentDate = dayjs();
    const currentYear = currentDate.year();
    const threeYearsAgo = currentYear - 2;

    let result = await OrderList.findAll({
      raw: true,
      attributes: [
        [Sequelize.literal("YEAR(Order.order_confirm_date)"), "year"],
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
        "stock_id",
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: {
            order_status: ["confirmed"],
            order_confirm_date: {
              [Op.between]: [
                dayjs(`${threeYearsAgo}-01-01`).toDate(),
                currentDate.toDate(),
              ],
            },
          },
        },
      ],
      group: ["year", "OrderList.stock_id"],
      where: { product_id: product_id },
    });

    let result2 = await PurchaseOrderList.findAll({
      raw: true,
      attributes: [
        [
          Sequelize.literal("YEAR(PurchaseOrder.purchase_order_confirm_date)"),
          "year",
        ],
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
        "stock_id",
      ],
      include: [
        {
          model: PurchaseOrder,
          attributes: [],
          where: {
            purchase_order_status: ["confirmed"],
            purchase_order_confirm_date: {
              [Op.between]: [
                dayjs(`${threeYearsAgo}-01-01`).toDate(),
                currentDate.toDate(),
              ],
            },
          },
        },
      ],
      group: ["year", "PurchaseOrderList.stock_id"],
      where: { product_id: product_id },
    });

    // Create an array with years from threeYearsAgo to currentYear
    let yearsArray = Array.from(
      { length: 3 },
      (_, index) => currentYear - index
    );

    result = yearsArray.map((m) => {
      let found = result.find((f) => f.year === m);
      if (!found) {
        return { year: m, total_quantity: 0, stock_id: 0 };
      }
      return {
        year: found.year,
        total_quantity: Number(found.total_quantity),
        stock_id: found.stock_id,
      };
    });

    result2 = yearsArray.map((m) => {
      let found = result2.find((f) => f.year === m);
      if (!found) {
        return { year: m, total_quantity: 0, stock_id: 0 };
      }
      return {
        year: found.year,
        total_quantity: Number(found.total_quantity),
        stock_id: found.stock_id,
      };
    });

    result.sort((a, b) => a.year - b.year);
    result2.sort((a, b) => a.year - b.year);
    yearsArray.sort((a, b) => a - b);
    yearsArray = yearsArray.map((m) => String(m));
    const transformedData = [
      { name: "Sales", data: result.map((entry) => entry.total_quantity) },
      { name: "Purchase", data: result2.map((entry) => entry.total_quantity) },
    ];

    if (!result || result.length === 0 || !result2 || result2.length === 0) {
      return res.json({ success: true, data: [] });
    } else {
      return res
        .status(200)
        .json({ success: true, data: transformedData, years: yearsArray });
    }
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  productYearlySold,
};
