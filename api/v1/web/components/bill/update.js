const { globalError } = require("../../../../../errors/globalError");
const Bill = require("../../../../../model/bill/bill");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");

const updateBillByBillIdOnLedgerDebit = async (req, res, next) => {
  try {
    const { amount, type } = req.body;
    if (type === "credit") {
      return res.status(200).json({
        success: true,
        message: `Rs ${amount} successfully ${type}`,
      });
    }
    const data = req?.bill;
    let availableAmount = parseFloat(amount);

    for (let i = 0; i < data.length; i++) {
      if (availableAmount < 0) {
        break;
      }

      const billId = data[i].Bill?.bill_id;

      if (parseFloat(data[i].Bill?.pending_amount) <= availableAmount) {
        const updateStatus = {
          bill_status: "paid",
          pending_amount: 0,
        };

        await Bill.update(updateStatus, {
          where: {
            bill_id: billId,
          },
        });

        availableAmount -= parseFloat(data[i].Bill?.pending_amount);
      } else {
        const updateStatus = {
          pending_amount:
            parseFloat(data[i].Bill?.pending_amount) - availableAmount,
        };

        await Bill.update(updateStatus, {
          where: {
            bill_id: billId,
          },
        });

        break;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Rs ${amount} successfully ${type}`,
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updatePurchaseBillByBillIdOnLedgerDebit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const data = req?.bill;
    if (type === "credit") {
      return res.status(200).json({
        success: true,
        message: `Rs ${amount} successfully ${type}`,
      });
    }
    let availableAmount = parseFloat(amount);

    for (let i = 0; i < data.length; i++) {
      if (availableAmount < 0) {
        break;
      }

      const billId = data[i].PurchaseBill?.purchase_bill_id;

      if (parseFloat(data[i].PurchaseBill?.pending_amount) <= availableAmount) {
        const updateStatus = {
          purchase_bill_status: "paid",
          pending_amount: 0,
        };

        await PurchaseBill.update(updateStatus, {
          where: {
            purchase_bill_id: billId,
          },
        });

        availableAmount -= parseFloat(data[i].PurchaseBill?.pending_amount);
      } else {
        const updateStatus = {
          pending_amount:
            parseFloat(data[i].PurchaseBill?.pending_amount) - availableAmount,
        };

        await PurchaseBill.update(updateStatus, {
          where: {
            purchase_bill_id: billId,
          },
        });

        break;
      }
    }

    return res
      .status(200)
      .json({ success: true, message: `Rs ${amount} successfully debited` });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateBillByBillIdOnPaymentThroughBill = async (req, res, next) => {
  try {
    const { amount, bill_id } = req.body;

    const bill = await Bill.findOne({
      where: {
        bill_id: bill_id,
      },
      limit: 1,
    });
    if (!bill) {
      return res.json({ success: false, message: "Bill Not Fount" });
    }
    const updateStatus = {
      pending_amount: parseFloat(bill.pending_amount) - parseFloat(amount),
      bill_status:
        parseFloat(bill.pending_amount) - parseFloat(amount) === 0
          ? "paid"
          : "pending",
    };

    await Bill.update(updateStatus, {
      where: {
        bill_id: bill_id,
      },
    });

    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateOrderBill = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      type = "NGST",
      totalTaxAmount = 0,
      totalCGSTAmount = 0,
      totalSGSTAmount = 0,
    } = req.body;

    const invoiceTotal = Math.round(
      totalTaxAmount + totalCGSTAmount + totalSGSTAmount
    );
    const subTotal = totalTaxAmount;

    const billData = {
      billing_amount: invoiceTotal,
      order_id: req?.body.order_id,
      retailer_id: req?.body.retailer_id,
      pending_amount: invoiceTotal,
      sub_total: subTotal,
    };

    const updatedBill = await Bill.update(billData, {
      where: {
        order_id: req.body.order_id,
      },
      transaction: t,
    });

    if (updatedBill[0] === 0) {
      await t.rollback();
      return next(globalError(405, `Order did not create`));
    } else {
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const updatePOBill = async (req, res, next) => {
  const t = req.t;
  try {
    const {
      type = "GST",
      totalTaxAmount = 0,
      totalCGSTAmount = 0,
      totalSGSTAmount = 0,
    } = req.body;

    const invoiceTotal = Math.round(
      totalTaxAmount + totalCGSTAmount + totalSGSTAmount
    );
    const subTotal = totalTaxAmount;

    const billData = {
      billing_amount: invoiceTotal,
      purchase_order_id: req?.body.purchase_order_id,
      vendor_id: req?.body.vendor_id,
      pending_amount: invoiceTotal,
      sub_total: subTotal,
    };

    const updateBill = await PurchaseBill.update(billData, {
      where: {
        purchase_order_id: req.body.purchase_order_id,
      },
      transaction: t,
    });

    if (updateBill[0] === 0) {
      await t.rollback();
      return next(globalError(405, `Purchase Order Not Updated`));
    } else {
      req.t = t;
      return next();
    }
  } catch (error) {
    await t.rollback();

    return next(globalError(500, error.message));
  }
};

module.exports = {
  updateBillByBillIdOnLedgerDebit,
  updatePurchaseBillByBillIdOnLedgerDebit,
  updateBillByBillIdOnPaymentThroughBill,
  updateOrderBill,
  updatePOBill,
};
