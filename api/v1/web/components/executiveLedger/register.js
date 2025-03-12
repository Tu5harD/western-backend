const { globalError } = require("../../../../../errors/globalError");
const ExecutiveLedger = require("../../../../../model/ledger/executiveLedger");

const registerExecutiveLedgerByAmountDebit = async (req, res, next) => {
  try {
    const { executive_id, type } = req.body;

    const latestLedgerEntry = await ExecutiveLedger.findOne({
      where: {
        executive_id: Number(executive_id),
      },
      order: [["created_at", "DESC"]],
      limit: 1,
    });

    if (latestLedgerEntry) {
      const amount = parseFloat(req.body?.amount);
      let balance = parseFloat(latestLedgerEntry.balance);

      if (type === "credit") {
        balance = balance + amount;
      }
      if (type === "debit") {
        balance = balance - amount;
      }

      const newLedgerEntry = {
        executive_id: executive_id,
        amount,
        payment_type: req.body?.payment_type,
        description: req.body?.description,
        type,
        balance,
      };

      const createdLedgerEntry = await ExecutiveLedger.create(newLedgerEntry);

      if (!createdLedgerEntry) {
        return next(globalError(406, "Executive Leader not created"));
      } else {
        req.ledger = createdLedgerEntry.toJSON();
        return res
          .status(200)
          .json({ success: true, message: `${req.body?.amount} ${type}` });
      }
    } else {
      const newLedgerEntry = {
        executive_id: Number(executive_id),
        amount: parseFloat(req.body?.amount),
        payment_type: req.body?.payment_type,
        description: req.body?.description,
        type,
        balance: parseFloat(req.body?.amount),
      };

      const createdLedgerEntry = await ExecutiveLedger.create(newLedgerEntry);

      if (!createdLedgerEntry) {
        return next(globalError(406, "Leader not created"));
      } else {
        req.ledger = createdLedgerEntry.toJSON();
        return res
          .status(200)
          .json({ success: true, message: `${req.body?.amount} ${type}` });
      }
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  registerExecutiveLedgerByAmountDebit,
};
