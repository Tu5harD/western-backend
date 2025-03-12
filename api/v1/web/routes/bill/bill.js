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
  getBillByBillId,
  getAllBills,
  getGSTR1Report,
  getGSTR2Report,
} = require("../../components/bill/fetch");

const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getBillByBillId
);

router.get(
  "/all",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllBills
);
router.get(
  "/gst/r1",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getGSTR1Report
);
router.get(
  "/gst/r2",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getGSTR2Report
);

module.exports = router;
