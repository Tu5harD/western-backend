const { globalError } = require("../../../../../errors/globalError");
const { Op } = require("sequelize");
const Order = require("../../../../../model/order/order");
const OrderList = require("../../../../../model/order/orderList");
const Bill = require("../../../../../model/bill/bill");

const { Sequelize, sequelize } = require("../../../../../config/database");

const newAndroidOrderRegistration = async (req, res, next) => {
  try {
    let value = {
      retailer_id: req?.body?.retailer_id,
      vendor_id: req?.body?.vendor_id,
      order_added_by_id:
        req?.authData?.authority[0] === "retailer" ||
        req?.authData?.authority[0] === "wholesaler"
          ? req?.authData?.user["retailer_id"]
          : req?.authData?.user[req?.authData?.authority[0] + "_id"],
      order_added_by: req?.authData?.authority[0],
    };

    const found = await Order.findOne({
      where: {
        retailer_id: req?.body?.retailer_id,
        [Op.and]: { order_status: "pending" },
      },
      order: [["createdAt", "DESC"]],
    });

    if (found) {
      req.order = found;
      return next();
    }

    const createdOrder = await Order.create(value);

    if (!createdOrder) {
      return next(globalError(405, `Order did not created`));
    } else {
      req.orders = {
        ...value,
        status: "pending",
        order_id: createdOrder.order_id,
      };
      return next();
    }
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const orderAndroidListRegister = async (req, res, next) => {
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
            { quantity: existingItem.quantity + orderItem.quantity },
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
      res.status(201).json({
        success: true,
        message: "Order successfully placed",
        data: { ...req.order },
      });
    } else {
      const createdOrderList = await OrderList.bulkCreate(orderListData);

      if (!createdOrderList || createdOrderList.length === 0) {
        return next(globalError(405, `Order list did not create`));
      } else {
        res.status(201).json({
          success: true,
          message: "Order successfully placed",
          data: { ...req.orders },
        });
      }
    }
  } catch (error) {
    const t = await sequelize.transaction();
    if (!req?.order) {
      try {
        await Order.destroy({
          where: { order_id: req?.orders.order_id },
          transaction: t,
        });
        await t.commit();
      } catch (rollbackError) {
        await t.rollback();
      }

      const deleteBillQuery = {
        where: {
          order_id: req?.orders.order_id,
        },
        force: true,
        individualHooks: true,
        transaction: t,
      };

      await Bill.destroy(deleteBillQuery);
    }
    return next(globalError(500, error.message));
  }
};

module.exports = { newAndroidOrderRegistration, orderAndroidListRegister };
