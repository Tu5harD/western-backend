const { globalError } = require("../../../../../errors/globalError");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");

const deletePO = async (req, res, next) => {
  try {
    let value = {
      purchase_order_deleted: true,
    };

    const updatePO = await PurchaseOrder.update(value);

    if (updatePO[0] == 0) {
      return next(globalError(405, `Purchase Order not deleted`));
    } else {
      return res.status(200).json({
        success: true,
        message: "Purchase Order Deleted Successfully",
      });
    }
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { deletePO };
