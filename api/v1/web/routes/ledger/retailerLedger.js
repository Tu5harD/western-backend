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
  fetchAllLedgerByRetailerIdAndAuthority,
} = require("../../../../../api/v1/web/components/retailerLedger/fetch");
const {
  registerLedgerByAmountDebit,
} = require("../../../../../api/v1/web/components/retailerLedger/register");
const {
  updateBillByBillIdOnLedgerDebit,
} = require("../../../../../api/v1/web/components/bill/update");
const {
  sumBillAmount,
} = require("../../../../../common/middleware/ledger/ledger");
const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllLedgerByRetailerIdAndAuthority
);

router.post(
  "/pay",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  sumBillAmount,
  registerLedgerByAmountDebit,
  updateBillByBillIdOnLedgerDebit
);
module.exports = router;
