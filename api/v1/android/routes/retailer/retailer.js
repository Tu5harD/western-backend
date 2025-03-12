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
const {
  getRetailerAllotedToExecutive,
} = require("../../components/retailer/fetch");
const {
  updateRetailertoken,
  updateRetailerWholesalerDetails,
  updatePasswordRetailer,
  updatePasswordExecutive,
  updateExecutiveDetails,
} = require("../../components/retailer/update");

const router = express.Router();

router.get(
  "/retailers",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  getRetailerAllotedToExecutive
);

router.post(
  "/retailer/token",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  updateRetailertoken
);

router.post(
  "/retailer/wholesaler/details",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  updateRetailerWholesalerDetails
);

router.post(
  "/retailer/wholesaler/password",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  updatePasswordRetailer
);

router.post(
  "/password",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  updatePasswordExecutive
);

router.post(
  "/update",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  updateExecutiveDetails
);

module.exports = router;
