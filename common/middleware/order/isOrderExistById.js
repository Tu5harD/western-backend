const { globalError } = require("../../../errors/globalError");
const Order = require("../../../model/order/order");
const Bill = require("../../../model/bill/bill");
const PurchaseOrder = require("../../../model/order/purchaseOrder");
const PurchaseBill = require("../../../model/bill/purchaseOrderBill");
const ReturnOrder = require("../../../model/order/returnOrder");
const ReturnBill = require("../../../model/bill/returnBill");
const { sequelize } = require("../../../config/database");

const isOrderExitsById = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const orderId = req.body?.order_id || req?.order.order_id;

    if (!req.authData.authority.includes("admin")) {
      return next(
        globalError(
          500,
          "You Do Not Have The Authority To Confirm or Reject the Order"
        )
      );
    }

    const order = await Order.findOne({
      where: {
        order_id: orderId,
        order_deleted: false,
      },
      include: [
        {
          model: Bill,
          attributes: [
            "bill_id",
            "billing_amount",
            "pending_amount",
            "bill_status",
          ],
        },
      ],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return next(globalError(404, "Order not found"));
    }

    const { order_status } = order;
    if (order_status !== "pending") {
      await t.rollback();
      return next(globalError(403, `Order already ${order_status}`));
    } else {
      req.orders = {
        retailer_id: order.retailer_id,
        billamount: order.Bill.billing_amount,
        order_status,
        billId: order.Bill.bill_id,
      };
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const isPurchaseOrderExitsById = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const purchaseId = req.body?.purchase_order_id;

    const order = await PurchaseOrder.findOne({
      where: {
        purchase_order_id: purchaseId,
        purchase_order_deleted: false,
      },
      include: [
        {
          model: PurchaseBill,
          attributes: [
            "purchase_bill_id",
            "billing_amount",
            "pending_amount",
            "purchase_bill_status",
          ],
        },
      ],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return next(globalError(404, "Purchase Order not found"));
    }

    const { purchase_order_status } = order;
    if (purchase_order_status !== "pending") {
      await t.commit();
      return next(globalError(403, `Order already ${purchase_order_status}`));
    } else {
      req.orders = {
        vendor_id: order.vendor_id,
        billamount: order.PurchaseBill.billing_amount,
        purchase_order_status,
        billId: order.PurchaseBill.purchase_bill_id,
      };
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const isReturnOrderExitsById = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const returId = req.body?.purchase_order_id;

    const order = await ReturnOrder.findOne({
      where: {
        return_order_id: returId,
        return_order_deleted: false,
      },
      include: [
        {
          model: ReturnBill,
          attributes: [
            "return_bill_id",
            "billing_amount",
            "pending_amount",
            "return_bill_status",
          ],
        },
      ],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return next(globalError(404, "Return Order not found"));
    }

    const { return_order_status } = order;
    if (return_order_status !== "pending") {
      await t.commit();
      return next(
        globalError(403, `Return Order already ${purchase_order_status}`)
      );
    } else {
      req.orders = {
        retailer_id: order.retailer_id,
        billamount: order.ReturnBill.billing_amount,
        return_order_status,
        billId: order.ReturnBill.return_bill_id,
      };
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = {
  isOrderExitsById,
  isPurchaseOrderExitsById,
  isReturnOrderExitsById,
};
