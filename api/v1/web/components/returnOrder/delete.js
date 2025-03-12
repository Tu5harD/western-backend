const { globalError } = require("../../../../../errors/globalError");
const ReturnOrder = require("../../../../../model/order/returnOrder");

const deleteReturnOrder = async (req, res, next) => {
  try {
    const { return_order_id } = req.body;

    const value = {
      return_order_deleted: true,
    };

    const deleteOrder = await ReturnOrder.update(value, {
      where: {
        return_order_id: return_order_id,
      },
    });

    if (deleteOrder[0] == 0) {
      return next(globalError(406, "Return Order could not Deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Order Deleted Sucessfully" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteReturnOrder };
