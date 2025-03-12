const { globalError } = require("../../../../../errors/globalError");
const Order = require("../../../../../model/order/order");
const OrderList = require("../../../../../model/order/orderList");
const { Sequelize, sequelize } = require("../../../../../config/database");

const newOrderRegistration = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const value = {
      retailer_id: req?.body?.retailer_id,
      order_added_by_id: req?.authData?.user?.admin_id,
      order_added_by: req?.authData?.user?.admin_name,
    };

    const createdOrder = await Order.create(value, { transaction: t });

    if (!createdOrder) {
      await t.rollback();
      return next(globalError(405, "Order did not get created"));
    }

    req.orders = {
      ...value,
      status: "pending",
      order_id: createdOrder.order_id,
    };
    req.t = t;
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

const orderListRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      quantity = [],
      unit = [],
      type = "GST",
      price = [],
      freeQuantity = [],
      gst = [],
      discount = [],
      product = [],
    } = req.body;

    const orderListData = product.map((item, index) => {
      return {
        quantity: quantity[index],
        free_quantity: parseFloat(freeQuantity[index]),
        order_id: req?.orders.order_id,
        product_id: item,
        price: parseFloat(price[index]),
        gst_rate: gst[index],
        total: parseFloat(price[index]) * parseFloat(quantity[index]),
        unit: unit[index],
        discount: discount[index],
      };
    });

    const createdOrderList = await OrderList.bulkCreate(orderListData, {
      transaction: t,
    });

    if (!createdOrderList || createdOrderList.length === 0) {
      await t.rollback();
      return next(globalError(405, `Order list did not create`));
    } else {
      await t.commit();

      res.status(201).json({
        success: true,
        message: "Order successfully placed",
        data: { ...req.orders },
      });
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = { newOrderRegistration, orderListRegister };
