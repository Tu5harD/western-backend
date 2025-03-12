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
  fetchWorkerLedger,
  fetchWorkerLedgerCsv,
  fetchWorkerLedgerExcel,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.post(
  "/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchWorkerLedger
);

router.post(
  "/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchWorkerLedgerCsv
);

router.post(
  "/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchWorkerLedgerExcel
);

module.exports = router;
