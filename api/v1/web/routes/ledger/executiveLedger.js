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
  fetchAllLedgerByExecutiveIdAndAuthority,
} = require("../../../../../api/v1/web/components/executiveLedger/fetch");
const {
  registerExecutiveLedgerByAmountDebit,
} = require("../../../../../api/v1/web/components/executiveLedger/register");
const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllLedgerByExecutiveIdAndAuthority
);

router.post(
  "/pay",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  registerExecutiveLedgerByAmountDebit
);
module.exports = router;
