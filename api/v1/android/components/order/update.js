const { globalError } = require("../../../../../errors/globalError");
const Bill = require("../../../../../model/bill/bill");
const Order = require("../../../../../model/order/order");
const { Op } = require("sequelize");
const OrderList = require("../../../../../model/order/orderList");
const { Sequelize, sequelize } = require("../../../../../config/database");
const { emitEvent } = require("../../../../../socket/events/emit");

const CancelOrderByRetailerId = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    await Order.update(
      { order_status: "cancel" },
      {
        where: {
          order_id: Number(order_id),
        },
      }
    );

    await Bill.update(
      {
        bill_status: "cancel",
      },
      {
        where: {
          order_id: Number(order_id),
        },
      }
    );

    emitEvent(
      "Cancel Order",
      `Order Cancelled By ${req?.authData?.authority[0]} ${
        req?.authData?.user[req?.authData?.authority[0] + "_name"]
      }`,
      "admin"
    );

    return res.status(200).json({
      success: true,
      message: `Order Successfully Cancelled`,
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateOrderByOrderId = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    const found = await Order.findOne({
      where: {
        order_id: order_id,
        [Op.and]: { order_status: "pending" },
      },
    });

    if (found) {
      req.order = found;
      return next();
    } else {
      return next(globalError(500, "order confirmed or not found"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateOrderListByOrderId = async (req, res, next) => {
  try {
    const { quantity = [] } = req.body;

    let orderListData = req.productList.map((item, index) => {
      return {
        quantity: quantity[index],
        order_id: req?.orders?.order_id || req?.order?.order_id,
        product_id: item.id,
        price: item.price,
        stock_id: item.stock_id,
      };
    });

    if (req.order) {
      const found = await OrderList.findAll({
        where: {
          order_id: req?.order?.order_id,
        },
      });
      for (const orderItem of orderListData) {
        const existingItem = found.find(
          (item) => item.product_id === orderItem.product_id
        );

        if (existingItem) {
          await OrderList.update(
            { quantity: orderItem.quantity },
            {
              where: {
                order_id: req?.order?.order_id,
                product_id: existingItem.product_id,
              },
            }
          );
        } else {
          await OrderList.create(orderItem);
        }
      }
      return res
        .status(200)
        .json({ success: true, message: "Order Successfully Updated" });
    } else {
      const createdOrderList = await OrderList.bulkCreate(orderListData);

      if (!createdOrderList || createdOrderList.length === 0) {
        return next(globalError(405, `Order list did not create`));
      } else {
        return res
          .status(200)
          .json({ success: true, message: "Order Successfully Updated" });
      }
    }
  } catch (error) {
    const t = await sequelize.transaction();
    return next(globalError(500, error.message));
  }
};
module.exports = {
  CancelOrderByRetailerId,
  updateOrderListByOrderId,
  updateOrderByOrderId,
};
