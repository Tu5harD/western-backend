const { globalError } = require("../../../../../errors/globalError");
const Bill = require("../../../../../model/bill/bill");
const Product = require("../../../../../model/product/product");
const Stock = require("../../../../../model/stock/stock");
const Ledger = require("../../../../../model/ledger/retailerLedger");
const {
  sendPushNotificationToAdmin,
} = require("../../../../../Notifications/notification");

const registerLedgerByOrderConfirmation = async (req, res, next) => {
  const t = req.t;
  try {
    if (req?.status === "rejected" || req?.status === "cancel") {
      const billId = req.orders?.billId;
      const billUpdate = await Bill.update(
        { bill_status: req?.status, pendingamount: 0 },
        {
          where: { bill_id: billId },
          transaction: t,
        }
      );
      if (billUpdate[0] === 0) {
        await t.rollback();
        return next(globalError(404, "Bill Not Updated"));
      }
      // emitEvent(
      //   "Order Rejected",
      //   `Order Cancelled By ${req?.authData?.authority[0]} ${
      //     req?.authData?.user[req?.authData?.authority[0] + "_name"]
      //   }`,
      //   "retailer",
      //   req?.orders?.retailer_id
      // );

      // const mssg = await sendPushNotificationToAdmin(
      //   "Order Rejected",
      //   `Order Rejected By ${req?.authData?.authority[0]} ${
      //     req?.authData?.user[req?.authData?.authority[0] + "_name"]
      //   }`,
      //   req?.orders?.retailer_id
      // );

      return res.status(201).json({
        success: true,
        message: "Order successfully rejected",
        notification: mssg,
      });
    }

    if (req.status != "rejected" && req.status != "cancel") {
      const billUpdate = await Bill.update(
        {
          items: JSON.stringify(req.items),
        },
        {
          where: { bill_id: req.orders?.billId },
          transaction: t,
        }
      );

      if (billUpdate[0] == 0) {
        await t.rollback();
        return next(globalError(404, "Bill Not Updated"));
      }
    }

    const amount = parseFloat(req.orders?.billamount);
    const retailer_id = req.orders?.retailer_id;
    const initialValue = {
      retailer_id,
      amount,
      type: "credit",
      // addedBy: req?.authData?.authority[0],
      // addedId: req?.authData?.user.id,
    };

    let value;
    const latestLedger = await Ledger.findOne({
      where: { retailer_id },
      order: [["created_at", "DESC"]],
      limit: 1,
    });

    if (latestLedger) {
      let balance = parseFloat(latestLedger.balance) || 0;
      balance =
        balance > 0
          ? balance + parseFloat(amount)
          : balance - parseFloat(amount);
      value = { ...initialValue, balance };
    } else {
      value = { ...initialValue, balance: -amount };
    }

    const createdLedger = await Ledger.create(value, { transaction: t });

    if (!createdLedger) {
      await t.rollback();
      return next(globalError(406, "Ledger not created"));
    } else {
      // emitEvent(
      //   "Order Confirmed",
      //   `Order Confirmed By ${req?.authData?.authority[0]} ${
      //     req?.authData?.user[req?.authData?.authority[0] + "_name"]
      //   }`,
      //   "retailer",
      //   req?.orders?.retailer_id
      // );

      // const mssg = await sendPushNotificationToAdmin(
      //   "Order Confirmed",
      //   `Order Confirmed By ${req?.authData?.authority[0]} ${
      //     req?.authData?.user[req?.authData?.authority[0] + "_name"]
      //   }`
      // );
      await t.commit();
      return res.status(201).json({
        success: true,
        message: "Order successfully confirmed",
        // notification: mssg,
      });
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

const registerLedgerByAmountDebit = async (req, res, next) => {
  try {
    const { retailer_id, type } = req.body;

    const latestLedgerEntry = await Ledger.findOne({
      where: {
        retailer_id: retailer_id,
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
        retailer_id: retailer_id,
        amount,
        payment_type: req.body?.payment_type,
        description: req.body?.description,
        type,
        balance,
      };

      const createdLedgerEntry = await Ledger.create(newLedgerEntry);

      if (!createdLedgerEntry) {
        return next(globalError(406, "Leader not created"));
      } else {
        req.ledger = createdLedgerEntry.toJSON();
        return next();
      }
    } else {
      return next(globalError(404, "Ledger not found"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  registerLedgerByOrderConfirmation,
  registerLedgerByAmountDebit,
};
