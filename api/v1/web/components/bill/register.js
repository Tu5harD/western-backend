const { globalError } = require("../../../../../errors/globalError");
const Order = require("../../../../../model/order/order");
const Bill = require("../../../../../model/bill/bill");
const ReturnOrder = require("../../../../../model/order/returnOrder");
const ReturnBill = require("../../../../../model/bill/returnBill");
const PurchaseOrder = require("../../../../../model/order/purchaseOrder");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");
const { Sequelize, sequelize } = require("../../../../../config/database");

const billRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      totalTaxAmount = 0,
      totalCGSTAmount = 0,
      totalSGSTAmount = 0,
    } = req.body;

    const invoiceTotal = Math.round(
      parseFloat(totalTaxAmount) +
        parseFloat(totalCGSTAmount) +
        parseFloat(totalSGSTAmount)
    );
    const subTotal = parseFloat(totalTaxAmount);

    const billData = {
      billing_amount: invoiceTotal,
      order_id: req?.orders.order_id,
      retailer_id: req?.orders.retailer_id,
      pending_amount: invoiceTotal,
      sub_total: subTotal,
    };

    const createdBill = await Bill.create(billData, { transaction: t });

    if (!createdBill) {
      await t.rollback();
      return next(globalError(405, `Order did not create`));
    } else {
      req.bill = {
        ...billData,
        status: "pending",
        bill_id: createdBill.bill_id,
      };
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const ReturnbillRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      totalTaxAmount = 0,
      totalCGSTAmount = 0,
      totalSGSTAmount = 0,
    } = req.body;

    const invoiceTotal = Math.round(
      parseFloat(totalTaxAmount) +
        parseFloat(totalCGSTAmount) +
        parseFloat(totalSGSTAmount)
    );
    const subTotal = parseFloat(totalTaxAmount);

    const billData = {
      billing_amount: invoiceTotal,
      return_order_id: req?.orders.return_order_id,
      retailer_id: req?.orders.retailer_id,
      pending_amount: invoiceTotal,
      sub_total: subTotal,
    };

    const createdBill = await ReturnBill.create(billData, { transaction: t });

    if (!createdBill) {
      await t.rollback();
      return next(globalError(405, `Return Order did not create`));
    }
    req.t = t;
    req.bill = {
      ...billData,
      status: "pending",
      return_bill_id: createdBill.return_bill_id,
    };
    return next();
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const PurchaseBillRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      totalTaxAmount = 0,
      totalCGSTAmount = 0,
      totalSGSTAmount = 0,
    } = req.body;

    const invoiceTotal = Math.round(
      parseFloat(totalTaxAmount) +
        parseFloat(totalCGSTAmount) +
        parseFloat(totalSGSTAmount)
    );
    const subTotal = parseFloat(totalTaxAmount);

    const billData = {
      billing_amount: invoiceTotal,
      purchase_order_id: req?.orders.purchase_order_id,
      vendor_id: req?.orders.vendor_id,
      pending_amount: invoiceTotal,
      sub_total: subTotal,
    };

    const createdBill = await PurchaseBill.create(billData, { transaction: t });

    if (!createdBill) {
      await t.rollback();
      return next(globalError(405, `Purchase Order did not create`));
    } else {
      req.bill = {
        ...billData,
        status: "pending",
        bill_id: createdBill.purchase_bill_id,
      };
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();

    return next(globalError(500, error.message));
  }
};

module.exports = { billRegister, ReturnbillRegister, PurchaseBillRegister };
