const Order = require("../../../../model/order/order");
const { Op } = require("sequelize");
const { globalError } = require("../../../../errors/globalError");

const isOrderConfirmedAlready = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findOne({
      where: {
        order_id: order_id,
      },
    });

    if (order?.order_status === "confirmed") {
      return next(globalError(500, "Order Already Confirmed You Can't Cancel"));
    }
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isOrderConfirmedAlready };
