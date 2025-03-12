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
  fetchGSTR1ReportPDF,
  fetchGSTR1ReportCSV,
  fetchGSTR1ReportExcel,
  fetchGSTR2ReportPDF,
  fetchGSTR2ReportCSV,
  fetchGSTR2ReportExcel,
} = require("../../../../../api/v1/web/components/document/fetch");

const router = express.Router();

router.get(
  "/r1/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchGSTR1ReportPDF
);

router.get(
  "/r2/pdf",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchGSTR2ReportPDF
);
router.get(
  "/r1/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchGSTR1ReportCSV
);

router.get(
  "/r2/csv",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchGSTR2ReportCSV
);

router.get(
  "/r1/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchGSTR1ReportExcel
);

router.get(
  "/r2/excel",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchGSTR2ReportExcel
);

module.exports = router;
