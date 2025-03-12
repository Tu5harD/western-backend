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
  fetchAllLedgerByWorkerIdAndAuthority,
} = require("../../../../../api/v1/web/components/workerLedger/fetch");
const {
  registerWorkerLedgerByAmountDebit,
} = require("../../../../../api/v1/web/components/workerLedger/register");
const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllLedgerByWorkerIdAndAuthority
);

router.post(
  "/pay",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  registerWorkerLedgerByAmountDebit
);
module.exports = router;
