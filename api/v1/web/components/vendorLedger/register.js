const { globalError } = require("../../../../../errors/globalError");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");
const VendorLedger = require("../../../../../model/ledger/vendorLedger");
const Product = require("../../../../../model/product/product");

const registerVendorLedgerByOrderConfirmation = async (req, res, next) => {
  const t = req.t;
  try {
    if (req?.status === "rejected") {
      const billId = req.orders?.billId;
      await PurchaseBill.update(
        { purchase_bill_status: "rejected", pendingamount: 0 },
        {
          where: { purchase_bill_id: billId },
          transaction: t,
        }
      );
      return res.status(201).json({
        success: true,
        message: "Purchase Order successfully rejected",
      });
    }

    const amount = parseFloat(req.orders?.billamount);
    const vendor_id = req.orders?.vendor_id;
    const initialValue = {
      vendor_id,
      amount,
      type: "credit",
      // addedBy: req?.authData?.authority[0],
      // addedId: req?.authData?.user.id,
    };

    let value;
    const latestLedger = await VendorLedger.findOne({
      where: { vendor_id },
      order: [["created_at", "DESC"]],
      limit: 1,
    });

    if (latestLedger) {
      let balance = parseFloat(latestLedger.balance) || 0;
      balance = balance > 0 ? balance + amount : balance - amount;
      value = { ...initialValue, balance };
    } else {
      value = { ...initialValue, balance: -amount };
    }

    const createdLedger = await VendorLedger.create(value, {
      transaction: t,
    });

    if (!createdLedger) {
      await t.rollback();
      return next(globalError(406, "Ledger not created"));
    } else {
      await t.commit();
      return res.status(201).json({
        success: true,
        message: `Purchase Order successfully ${req.body.status}`,
      });
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const registerVendorLedgerByAmountDebit = async (req, res, next) => {
  try {
    const { vendor_id, type } = req.body;

    const latestLedgerEntry = await VendorLedger.findOne({
      where: {
        vendor_id: vendor_id,
      },
      order: [["created_at", "DESC"]],
      limit: 1,
    });

    if (latestLedgerEntry) {
      const amount = parseFloat(req.body?.amount);
      let balance = parseFloat(latestLedgerEntry.balance);

      if (type === "credit") {
        balance = balance - amount;
      }
      if (type === "debit") {
        balance = balance + amount;
      }

      const newLedgerEntry = {
        vendor_id: vendor_id,
        amount,
        payment_type: req.body?.payment_type,
        description: req.body?.description,
        type,
        balance,
      };

      const createdLedgerEntry = await VendorLedger.create(newLedgerEntry);

      if (!createdLedgerEntry) {
        return next(globalError(406, "Vendor Leader not created"));
      } else {
        req.ledger = createdLedgerEntry.toJSON();
        return next();
      }
    } else {
      return next(globalError(404, "Vendor Ledger not found"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  registerVendorLedgerByOrderConfirmation,
  registerVendorLedgerByAmountDebit,
};
