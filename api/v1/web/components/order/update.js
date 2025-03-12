const { globalError } = require("../../../../../errors/globalError");
const Order = require("../../../../../model/order/order");
const OrderList = require("../../../../../model/order/orderList");
const { Sequelize, sequelize } = require("../../../../../config/database");

const updateOrderByOrderConfirmation = async (req, res, next) => {
  const t = req.t;
  try {
    const { status, order_id } = req.body;

    const value = {
      order_status: String(status).trim().toLowerCase(),
      order_confirm_date: new Date(),
    };

    const order = await Order.update(value, {
      where: {
        order_id: order_id,
      },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return next(globalError(406, "Order could not be updated"));
    } else {
      req.status = value.order_status;
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const updateOrderMaster = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const value = {
      retailer_id: req?.body?.retailer_id,
    };

    const found = await Order.findOne({
      where: {
        order_id: req.body.order_id,
        order_status: "confirmed",
      },
      transaction: t,
    });

    if (found) {
      await t.rollback();
      return next(
        globalError(405, "Order ALready Confirmed You cannot edit It")
      );
    }

    const updatedOrder = await Order.update(value, {
      where: {
        order_id: req.body.order_id,
      },
      transaction: t,
    });

    if (updatedOrder[0] === 0) {
      await t.rollback();
      return next(globalError(405, "Order did not get created"));
    }
    req.t = t;
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

const updateOrderList = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      quantity = [],
      unit = [],
      type = "GST",
      price = [],
      freeQuantity = [],
      product = [],
      gst = [],
      discount = [],
    } = req.body;

    await OrderList.destroy({
      where: {
        order_id: req.body.order_id,
      },
      transaction: t,
    });

    const orderListData = product.map((item, index) => ({
      quantity: quantity[index],
      free_quantity: parseFloat(freeQuantity[index]),
      order_id: req?.body.order_id,
      product_id: item,
      price: parseFloat(price[index]),
      gst_rate: gst[index],
      total: parseFloat(price[index]) * parseFloat(quantity[index]),
      unit: unit[index],
      discount: discount[index],
    }));

    for (const order of orderListData) {
      await OrderList.create(order, {
        transaction: t,
      });
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Order successfully updated",
    });
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = {
  updateOrderByOrderConfirmation,
  updateOrderMaster,
  updateOrderList,
};
