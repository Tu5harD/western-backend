const express = require("express");
const {
  tokenValidator,
} = require("../../../../../common/middleware/token/tokenValidator");
const {
  tokenTypeValidatorAdmin,
} = require("../../../../../common/middleware/token/tokenTypeValidator");
const {
  isTokenUserExists,
} = require("../../../../../common/middleware/token/isTokenUserExists");
const {
  fetchAllLedgerByVendorIdAndAuthority,
} = require("../../../../../api/v1/web/components/vendorLedger/fethc");
const {
  registerVendorLedgerByAmountDebit,
} = require("../../../../../api/v1/web/components/vendorLedger/register");
const {
  updatePurchaseBillByBillIdOnLedgerDebit,
} = require("../../../../../api/v1/web/components/bill/update");
const {
  sumPurchaseBillAmount,
} = require("../../../../../common/middleware/ledger/ledger");
const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllLedgerByVendorIdAndAuthority
);

router.post(
  "/pay",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  sumPurchaseBillAmount,
  registerVendorLedgerByAmountDebit,
  updatePurchaseBillByBillIdOnLedgerDebit
);
module.exports = router;
