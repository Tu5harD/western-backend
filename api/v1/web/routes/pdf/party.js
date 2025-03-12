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
  fetchPartyPendingBalanceCSV,
  fetchPartyPendingBalanceExcel,
  fetchPartyPendingBalancePDF,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.get(
  "/pending/amount/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchPartyPendingBalancePDF
);

router.get(
  "/pending/amount/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchPartyPendingBalanceCSV
);
router.get(
  "/pending/amount/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchPartyPendingBalanceExcel
);

module.exports = router;
