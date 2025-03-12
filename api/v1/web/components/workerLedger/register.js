const { globalError } = require("../../../../../errors/globalError");
const WorkerLedger = require("../../../../../model/ledger/workerLedger");

const registerWorkerLedgerByAmountDebit = async (req, res, next) => {
  try {
    const { worker_id, type } = req.body;

    const latestLedgerEntry = await WorkerLedger.findOne({
      where: {
        worker_id: Number(worker_id),
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
        worker_id: worker_id,
        amount,
        payment_type: req.body?.payment_type,
        description: req.body?.description,
        type,
        balance,
      };

      const createdLedgerEntry = await WorkerLedger.create(newLedgerEntry);

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
        worker_id: Number(worker_id),
        amount: req.body?.amount,
        payment_type: req.body?.payment_type,
        description: req.body?.description,
        type,
        balance: req.body?.amount,
      };

      const createdLedgerEntry = await WorkerLedger.create(newLedgerEntry);

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
  registerWorkerLedgerByAmountDebit,
};
