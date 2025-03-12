const { globalError } = require("../../../../../errors/globalError");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");
const PurchaseOrderList = require("../../../../../model/order/purchaseOrderList");
const { sequelize } = require("../../../../../config/database");

const updatePurchaseOrderByOrderConfirmation = async (req, res, next) => {
  const t = req.t;
  try {
    const { status, purchase_order_id } = req.body;

    const value = {
      purchase_order_status: String(status).trim().toLowerCase(),
      purchase_order_confirm_date: new Date(),
    };

    const order = await PurchaseOrder.update(value, {
      where: {
        purchase_order_id: purchase_order_id,
      },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return next(globalError(406, "Order could not be updated"));
    } else {
      req.status = value.purchase_order_status;
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
  updatePurchaseOrderByOrderConfirmation,
  updatePOMaster,
  updatePOList,
};
