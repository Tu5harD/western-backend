const { globalError } = require("../../../../../errors/globalError");
const ReturnOrder = require("../../../../../model/order/returnOrder");
const ReturnOrderList = require("../../../../../model/order/returnOrderList");
const ReturnBill = require("../../../../../model/bill/returnBill");
const { Sequelize, sequelize } = require("../../../../../config/database");

const newReturnOrderRegistration = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let value = {
      retailer_id: req?.body?.retailer_id,
      bill_id: req?.body?.bill_id,
    };

    const createdOrder = await ReturnOrder.create(value, {
      transaction: t,
    });

    if (!createdOrder) {
      await t.rollback();
      return next(globalError(405, `Return Order did not created`));
    }
    req.t = t;
    req.orders = {
      ...value,
      status: "pending",
      return_order_id: createdOrder.return_order_id,
    };
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

const ReturnorderListRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      quantity = [],
      price = [],
      unit = [],
      product = [],
      gst = [],
      discount = [],
      expiry_date = [],
      return_type = [],
    } = req.body;

    const orderListData = product.map((item, index) => {
      return {
        quantity: quantity[index],
        return_order_id: req?.orders.return_order_id,
        product_id: item,
        price: price[index],
        unit: unit[index],
        gst_rate: gst[index],
        discount: discount[index],
        expiry_date: expiry_date[index],
        return_type: return_type[index],
      };
    });
    console.log("hi");
    const createdOrderList = await ReturnOrderList.bulkCreate(orderListData, {
      transaction: t,
    });

    if (!createdOrderList || createdOrderList.length === 0) {
      await t.rollback();
      return next(globalError(405, `return Order list did not create`));
    }
    await t.commit();
    return res
      .status(200)
      .json({ success: true, message: "Return Order Successfully Placed" });
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = { newReturnOrderRegistration, ReturnorderListRegister };
