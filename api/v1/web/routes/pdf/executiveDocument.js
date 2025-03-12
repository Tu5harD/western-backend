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
  fetchExecutiveLedger,
  fetchExecutiveLedgerCsv,
  fetchExecutiveLedgerExcel,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.post(
  "/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchExecutiveLedger
);

router.post(
  "/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchExecutiveLedgerCsv
);

router.post(
  "/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchExecutiveLedgerExcel
);

module.exports = router;
