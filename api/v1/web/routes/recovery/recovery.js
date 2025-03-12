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
  getAllRetailerReportWhoseBalanceisPending,
  getAllRetailerToRecoverPayment,
} = require("../../components/reminder/fetch");

const {
  updateReminderByRetailerId,
} = require("../../components/reminder/update");

const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRetailerReportWhoseBalanceisPending
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateReminderByRetailerId
);

router.get(
  "/dashboard",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRetailerToRecoverPayment
);

module.exports = router;
