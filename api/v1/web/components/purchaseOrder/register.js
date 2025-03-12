const { globalError } = require("../../../../../errors/globalError");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");
const PurchaseOrderList = require("../../../../../model/order/purchaseOrderList");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");
const { sequelize } = require("../../../../../config/database");

const newPurchaseOrderRegistration = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let value = {
      vendor_id: req?.body?.vendor_id,
    };

    const createdOrder = await PurchaseOrder.create(value, { transaction: t });

    if (!createdOrder) {
      await t.rollback();
      return next(globalError(405, `Order did not created`));
    } else {
      req.orders = {
        ...value,
        status: "pending",
        purchase_order_id: createdOrder.purchase_order_id,
      };
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

const PurchaseOrderListRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      quantity = [],
      type = "GST",
      price = [],
      unit = [],
      product = [],
      gst = [],
      discount = [],
      expiry_date = [],
    } = req.body;

    const orderListData = product.map((item, index) => {
      return {
        quantity: parseFloat(quantity[index]),
        purchase_order_id: req?.orders.purchase_order_id,
        product_id: item,
        price: parseFloat(price[index]),
        gst_rate: gst[index],
        unit: unit[index],
        total: parseFloat(quantity[index]) * parseFloat(price[index]),
        discount: discount[index],
        expiry_date: expiry_date[index],
      };
    });

    const createdOrderList = await PurchaseOrderList.bulkCreate(orderListData, {
      transaction: t,
    });

    if (!createdOrderList || createdOrderList.length === 0) {
      await t.rollback();
      return next(globalError(405, `Order list did not create`));
    } else {
      await t.commit();
      return res.status(200).json({
        success: true,
        message: "Purchase Order Successfully Created",
      });
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = { newPurchaseOrderRegistration, PurchaseOrderListRegister };
