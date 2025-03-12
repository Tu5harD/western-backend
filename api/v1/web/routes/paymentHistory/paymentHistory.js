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
  newPaymentThroughBillRegistration,
} = require("../../components/paymentHistory/register");
const {
  getPaymentHistoryByBillId,
} = require("../../components/paymentHistory/fetch");
const {
  updateBillByBillIdOnPaymentThroughBill,
} = require("../../components/bill/update");
const {
  UpdateLedgerByBillPayment,
} = require("../../components/retailerLedger/update");

const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newPaymentThroughBillRegistration,
  updateBillByBillIdOnPaymentThroughBill,
  UpdateLedgerByBillPayment
);

router.get(
  "/history",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getPaymentHistoryByBillId
);

module.exports = router;
