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
  fetchProductWiseProfitLossCSV,
  fetchProductWiseProfitLossExcel,
  fetchProductWiseProfitLossPDF,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.get(
  "/profit/loss/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchProductWiseProfitLossPDF
);

router.get(
  "/profit/loss/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchProductWiseProfitLossCSV
);
router.get(
  "/profit/loss/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchProductWiseProfitLossExcel
);

module.exports = router;
