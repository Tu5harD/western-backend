const { globalError } = require("../../../../../errors/globalError");
const ReturnOrder = require("../../../../../model/order/returnOrder");
const ReturnOrderList = require("../../../../../model/order/returnOrderList");
const { sequelize } = require("../../../../../config/database");

const updateReturnOrderByOrderConfirmation = async (req, res, next) => {
  const t = req.t;
  try {
    const { status, return_order_id } = req.body;

    const value = {
      return_order_status: String(status).trim().toLowerCase(),
      return_order_confirm_date: new Date(),
    };

    const order = await ReturnOrder.update(value, {
      where: {
        return_order_id: return_order_id,
      },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return next(globalError(406, "Return Order could not be updated"));
    } else {
      req.status = value.return_order_status;
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const updatePOMaster = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let value = {
      vendor_id: req?.body?.vendor_id,
    };

    const updatedPO = await PurchaseOrder.update(value, {
      where: {
        purchase_order_id: req.body.purchase_order_id,
      },
      transaction: t,
    });

    if (updatedPO[0] == 0) {
      await t.rollback();
      return next(globalError(405, `Purchase Order Not Upddated`));
    } else {
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

const updatePOList = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      quantity = [],
      type = "GST",
      price = [],
      unit = [],
      purchase_order_id = "",
      product = [],
      gst = [],
      discount = [],
      expiry_date = [],
    } = req.body;

    await PurchaseOrderList.destroy({
      where: {
        purchase_order_id: purchase_order_id,
      },
      transaction: t,
    });

    const orderListData = product.map((item, index) => {
      return {
        quantity: parseFloat(quantity[index]),
        purchase_order_id: purchase_order_id,
        product_id: item,
        price: parseFloat(price[index]),
        gst_rate: gst[index],
        unit: unit[index],
        total: parseFloat(quantity[index]) * parseFloat(price[index]),
        discount: discount[index],
        expiry_date: expiry_date[index],
      };
    });
    for (const order of orderListData) {
      await PurchaseOrderList.create(order, {
        transaction: t,
      });
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Purchase Order Successfully Updated",
    });
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = {
  updateReturnOrderByOrderConfirmation,
  updatePOMaster,
  updatePOList,
};
