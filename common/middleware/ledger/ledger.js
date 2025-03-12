const { globalError } = require("../../../errors/globalError");
const Order = require("../../../model/order/order");
const Bill = require("../../../model/bill/bill");
const PurchaseOrder = require("../../../model/order/purchaseOrder");
const PurchaseBill = require("../../../model/bill/purchaseOrderBill");

const sumBillAmount = async (req, res, next) => {
  try {
    const { retailer_id, amount } = req.body;

    const orders = await Order.findAndCountAll({
      attributes: ["order_id"],
      where: {
        retailer_id: retailer_id,
        order_status: "confirmed",
      },
      include: {
        model: Bill,
        attributes: ["bill_id", "pending_amount"],
        where: {
          bill_status: "pending",
        },
      },
      order: [["created_at", "ASC"]],
    });

    const data = orders?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });

    if (orders.length === 0) {
      return next(globalError(406, `You do not have any outstanding balance`));
    } else {
      const invoiceTotal = data
        .map((order) => order.Bill.pending_amount)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      if (amount > invoiceTotal) {
        return next(
          globalError(
            406,
            `We can only accept amounts below or equal to ${invoiceTotal}`
          )
        );
      }

      req.bill = data;
      return next();
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const sumPurchaseBillAmount = async (req, res, next) => {
  try {
    const { vendor_id, amount } = req.body;

    const orders = await PurchaseOrder.findAndCountAll({
      attributes: ["purchase_order_id"],
      where: {
        vendor_id: vendor_id,
        purchase_order_status: "confirmed",
      },
      include: {
        model: PurchaseBill,
        attributes: ["purchase_bill_id", "pending_amount"],
        where: {
          purchase_bill_status: "pending",
        },
      },
      order: [["created_at", "ASC"]],
    });

    const data = orders?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });

    if (orders.length === 0) {
      return next(globalError(406, `You do not have any outstanding balance`));
    } else {
      const invoiceTotal = data
        .map((order) => order.PurchaseBill.pending_amount)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      if (amount > invoiceTotal) {
        return next(
          globalError(
            406,
            `We can only accept amounts below or equal to ${invoiceTotal}`
          )
        );
      }

      req.bill = data;
      return next();
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { sumBillAmount, sumPurchaseBillAmount };
