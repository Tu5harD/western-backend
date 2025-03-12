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
  isProductArrayExists,
} = require("../../../../../common/middleware/product/isProductArrayExist");
const {
  newChallanRegistration,
  challanListRegister,
} = require("../../components/challan/register");
const {
  registerLedgerByOrderConfirmation,
} = require("../../components/retailerLedger/register");
const {
  updateOrderByOrderConfirmation,
} = require("../../components/order/update");
const {
  fetchChallanDetailsById,
  fetchAllDeliveryChallan,
} = require("../../components/challan/fetch");

const {
  updateStockWhenOrderRegister,
} = require("../../components/stock/fetch");

const { billRegister } = require("../../components/bill/register");

const router = express.Router();

router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllDeliveryChallan
);

router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchChallanDetailsById
);
router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isProductArrayExists,
  newChallanRegistration,
  challanListRegister
);

module.exports = router;
