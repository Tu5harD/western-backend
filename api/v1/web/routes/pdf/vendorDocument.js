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
  fetchVendorLedger,
  fetchVendorLedgerCsv,
  fetchVendorLedgerExcel,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.post(
  "/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchVendorLedger
);

router.post(
  "/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchVendorLedgerCsv
);

router.post(
  "/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchVendorLedgerExcel
);

module.exports = router;
