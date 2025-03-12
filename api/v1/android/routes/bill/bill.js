const express = require("express");
const {
  tokenValidator,
} = require("../../../../../common/middleware/token/tokenValidator");
const {
  tokenTypeAndroidValidatorRetailer,
} = require("../../../../../common/middleware/token/tokenTypeValidator");
const {
  isTokenUserExists,
} = require("../../../../../common/middleware/token/isTokenUserExists");
const { getMonthlyBill } = require("../../components/bill/fetch");

const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  getMonthlyBill
);

module.exports = router;
