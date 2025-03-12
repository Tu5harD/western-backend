const { globalError } = require("../../../../../errors/globalError");
const Ledger = require("../../../../../model/ledger/retailerLedger");
const ReturnBill = require("../../../../../model/bill/returnBill");

const UpdateLedgerByBillPayment = async (req, res, next) => {
  try {
    const { amount, retailer_id } = req.body;

    const latestLedger = await Ledger.findOne({
      where: { retailer_id: Number(retailer_id) },
      order: [["ledger_id", "DESC"]],
      limit: 1,
    });

    if (!latestLedger) {
      res.status(500).json({ success: false, message: "Ledger Not Found" });
    }

    let balance = -parseFloat(latestLedger.balance || 0);
    let updatedbalance = -(balance - parseFloat(amount));

    const updatedValues = { balance: updatedbalance };

    await Ledger.update(updatedValues, {
      where: {
        ledger_id: latestLedger.ledger_id,
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Payment Successfully Done" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const updateLedgerWhenOrderReturn = async (req, res, next) => {
  const t = req.t;
  try {
    if (req?.status === "rejected") {
      const billId = req.orders?.billId;
      const billUpdate = await ReturnBill.update(
        { return_bill_status: req?.status, pendingamount: 0 },
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
        message: "Return Order successfully rejected",
        notification: mssg,
      });
    }

    const amount = parseFloat(req.orders?.billamount);
    const retailer_id = req.orders?.retailer_id;
    const initialValue = {
      retailer_id,
      amount,
      type: "debit",
    };

    let value;
    const latestLedger = await Ledger.findOne({
      where: { retailer_id },
      order: [["created_at", "DESC"]],
      limit: 1,
    });

    if (!latestLedger) {
      await t.rollback();
      return next(globalError(406, "Ledger not Found"));
    }

    let balance = parseFloat(latestLedger.balance) || 0;
    balance = balance + parseFloat(amount);
    value = { ...initialValue, balance };

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
        message: "Return Order successfully confirmed",
        // notification: mssg,
      });
    }
  } catch (error) {
    await t.rollback();
    return next(globalError(500, error.message));
  }
};

module.exports = {
  UpdateLedgerByBillPayment,
  updateLedgerWhenOrderReturn,
};
