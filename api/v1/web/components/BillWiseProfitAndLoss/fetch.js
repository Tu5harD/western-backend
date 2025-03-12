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

const billWiseProfitAndLoss = async (req, res, next) => {
  try {
    const {
      pageIndex = 1,
      pageSize = 10,
      startDate,
      endDate,
      query = "",
    } = req.query;

    const nextDayEndDate = new Date(
      new Date(endDate).getTime() + 24 * 60 * 60 * 1000
    );

    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { retailer_status: true }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    const limit = +pageSize;
    const offset = (+pageIndex - 1) * limit;
    let bills = await Bill.findAll({
      where: {
        bill_status: {
          [Op.in]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [startDate, nextDayEndDate],
        },
      },
      attributes: [
        "bill_id",
        "order_id",
        "billing_amount",
        "pending_amount",
        "bill_status",
        "createdAt",
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
        {
          model: Order,
          attributes: ["order_id"],
          include: [
            {
              model: OrderList,
              attributes: ["product_id", "quantity"],
              include: [
                {
                  model: Stock,
                  attributes: ["stock_sale_price", "stock_purchase_price"],
                },
              ],
            },
          ],
        },
      ],
      order: [["bill_id", "DESC"]],
      limit: limit,
      offset: offset,
    });
    if (!bills) {
      return res.json({ success: true, data: bills.length });
    }

    let billss = bills.map((m) => {
      let bill_amount = m.billing_amount;
      let pending_amount = m.pending_amount;
      let purchase_price = m.Order.OrderLists.reduce(
        (acc, curr) =>
          acc + Math.round(curr.Stock.stock_purchase_price * curr.quantity),
        0
      );
      let total = Math.round(bill_amount - pending_amount);
      let profit_loss = Math.round(total - purchase_price);
      let retailer_name = m.Retailer.retailer_name;
      return {
        bill_id: m.bill_id,
        profit_loss: profit_loss,
        status: profit_loss >= 0 ? "profit" : "loss",
        retailer_name: retailer_name,
        total_amount: bill_amount,
        pending_amount: m.pending_amount,
        date: dayjs(m.createdAt).format("YYYY-MM-DD"),
      };
    });

    return res
      .status(200)
      .json({ success: true, data: billss, total: billss.length });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const productWiseProfitAndLoss = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "" } = req.query;

    const condition = {
      [Op.and]: [],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          product_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    const limit = +pageSize;
    const offset = (+pageIndex - 1) * limit;

    const result = await OrderList.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
        "stock_id",
      ],
      include: [
        {
          model: Order,
          attributes: [
            "order_id",
            "order_status",
            "order_confirm_date",
            "retailer_id",
          ], // Include specific Order columns
          where: {
            order_status: ["confirmed", "pending"],
            order_deleted: false,
          },
          include: [
            {
              model: Retailer,
              attributes: ["retailer_id", "type"],
              // where: {
              //   type: "retailer",
              // },
            },
          ],
        },
        {
          model: Stock,
          attributes: [
            "stock_id",
            "product_id",
            "stock_wholesaler_price",
            "stock_retailer_price",
            "stock_purchase_price",
          ],
          include: [
            {
              model: Product,
              attributes: ["product_name", "product_id"],
              where: condition,
            },
          ],
        },
      ],
      group: ["OrderList.stock_id", "Order.Retailer.type"],
      limit: limit,
      offset: offset,
    });
    if (result.length == 0) {
      return res.json({ success: true, data: [] });
    } else {
      let profitLossRetailer = result
        .filter((m) => m.Order?.Retailer?.type === "retailer")
        .map((m) => {
          const stock = m.Stock || {};
          const product = stock.Product || {};
          const stockRetailerPrice = Number(stock.stock_retailer_price);
          const totalSaleQuantity = Number(m.dataValues.total_quantity);

          const totalRetailerProfit = Math.round(
            stockRetailerPrice - stock.stock_purchase_price
          );

          const totalProfitLoss = Math.round(
            totalRetailerProfit * totalSaleQuantity
          );

          return {
            product_id: product.product_id,
            total_quantity: totalSaleQuantity,
            stock_retailer_price: stockRetailerPrice,
            product: product.product_name,
            retailer_profit_loss: totalProfitLoss,
            wholesaler_profit_loss: 0,
          };
        });

      let profitLossWholesaler = result
        .filter((m) => m.Order?.Retailer?.type === "wholesaler")
        .map((m) => {
          const stock = m.Stock || {};
          const product = stock.Product || {};
          const stockWholesalerPrice = Number(stock.stock_wholesaler_price);
          const totalSaleQuantity = Number(m.dataValues.total_quantity);
          const totalWholesalerProfit = Math.round(
            stockWholesalerPrice - stock.stock_purchase_price
          );
          const totalProfitLoss = Math.round(
            totalWholesalerProfit * totalSaleQuantity
          );

          return {
            product_id: product.product_id,
            total_quantity: totalSaleQuantity,
            stock_wholesaler_price: stockWholesalerPrice,
            product: product.product_name,
            wholesaler_profit_loss: totalProfitLoss,
            retailer_profit_loss: 0,
          };
        });

      const aggregatedProfitLoss = {};

      [...profitLossRetailer, ...profitLossWholesaler].forEach((item) => {
        const key = item.product_id;

        if (!aggregatedProfitLoss[key]) {
          aggregatedProfitLoss[key] = {
            product_id: item.product_id,
            total_quantity: 0,
            retailer_profit_loss: 0,
            wholesaler_profit_loss: 0,
            product: item.product,
          };
        }

        aggregatedProfitLoss[key].total_quantity += item.total_quantity;
        aggregatedProfitLoss[key].retailer_profit_loss +=
          item.retailer_profit_loss;
        aggregatedProfitLoss[key].wholesaler_profit_loss +=
          item.wholesaler_profit_loss;
      });

      const finalResult = Object.values(aggregatedProfitLoss);

      return res.status(200).json({
        success: true,
        data: finalResult,
        total: finalResult.length,
      });
    }
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const partyOverallPendingBalance = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "" } = req.query;

    const condition = {
      [Op.and]: [],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    const limit = +pageSize;
    const offset = (+pageIndex - 1) * limit;

    let bills = await Bill.findAll({
      where: {
        bill_status: "pending",
      },
      attributes: [
        "retailer_id",
        [
          sequelize.fn("SUM", sequelize.col("pending_amount")),
          "totalPendingAmount",
        ],
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
      ],
      group: ["retailer_id"],
      limit: limit,
      offset: offset,
    });
    if (bills.length === 0) {
      return res.json({ success: true, data: bills.length });
    }

    return res
      .status(200)
      .json({ success: true, data: bills, total: bills.length });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  billWiseProfitAndLoss,
  productWiseProfitAndLoss,
  partyOverallPendingBalance,
};
