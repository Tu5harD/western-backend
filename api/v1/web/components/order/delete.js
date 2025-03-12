const { globalError } = require("../../../../../errors/globalError");
const Order = require("../../../../../model/order/order");

const deleteOrder = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    const value = {
      order_deleted: true,
    };

    const order = await Order.update(value, {
      where: {
        order_id: order_id,
      },
    });

    if (order[0] == 0) {
      return next(globalError(406, "Order Not Deleted"));
    } else {
      return res
        .status(200)
        .json({ success: true, message: "order successfully deleted" });
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteOrder };
