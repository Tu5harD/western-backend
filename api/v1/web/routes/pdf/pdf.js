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
  fetchRetailerLedger,
  fetchRetailerLedgerCsv,
  fetchRetailerLedgerExcel,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.post(
  "/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchRetailerLedger
);

router.post(
  "/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchRetailerLedgerCsv
);

router.post(
  "/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchRetailerLedgerExcel
);

module.exports = router;
