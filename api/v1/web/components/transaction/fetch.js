const { Op, Sequelize } = require("sequelize");
const RetailerLedger = require("../../../../../model/ledger/retailerLedger");
const VendorLedger = require("../../../../../model/ledger/vendorLedger");
const { globalError } = require("../../../../../errors/globalError");

const getProfitAndLoss = async (req, res, next) => {
  try {
    const retailerBalances = await RetailerLedger.findAll({
      attributes: ["retailer_id", "balance"],
      group: ["retailer_id"],
      order: [["retailer_id", "DESC"]],
    });

    retailerTotal = retailerBalances.reduce(
      (acc, curr) => Math.round(-curr.balance + acc),
      0
    );

    const vendorBalances = await VendorLedger.findAll({
      attributes: ["vendor_id", "balance"],
      group: ["vendor_id"],
      order: [["vendor_id", "DESC"]],
    });

    vendorTotal = vendorBalances.reduce(
      (acc, curr) => Math.round(-curr.balance + acc),
      0
    );

    const profitAndLoss = Math.round(retailerTotal) - Math.round(vendorTotal);

    return res.status(200).json({ success: true, data: profitAndLoss });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getProfitAndLoss };
