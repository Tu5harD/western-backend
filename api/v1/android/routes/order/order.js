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
  isAndroidProductArrayExists,
} = require("../../../../../common/middleware/android/product/isAndroidProductArrayExist");
const {
  isOrderConfirmedAlready,
} = require("../../../../../common/middleware/android/order/isOrderConfirmedAlready");
const {
  newAndroidOrderRegistration,
  orderAndroidListRegister,
} = require("../../components/order/register");
const {
  updateOrderByOrderId,
  updateOrderListByOrderId,
} = require("../../components/order/update");
const { updatebillAndroidByOrderId } = require("../../components/bill/update");
const {
  fetchAllAndroidOrderByRetailerId,
  fetchAndroidOrderDetailsById,
} = require("../../components/order/fetch");
const { CancelOrderByRetailerId } = require("../../components/order/update");

const {
  updateStockWhenAndroidOrderRegister,
} = require("../../components/stock/update");

const { billAndroidRegister } = require("../../components/bill/register");

const router = express.Router();

router.post(
  "/",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  fetchAllAndroidOrderByRetailerId
);

router.post(
  "/id",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  fetchAndroidOrderDetailsById
);

router.post(
  "/register",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  isAndroidProductArrayExists,
  newAndroidOrderRegistration,
  billAndroidRegister,
  orderAndroidListRegister,
  updateStockWhenAndroidOrderRegister
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  isAndroidProductArrayExists,
  updateOrderByOrderId,
  updatebillAndroidByOrderId,
  updateOrderListByOrderId
);

router.put(
  "/cancel/id",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  isOrderConfirmedAlready,
  CancelOrderByRetailerId
);

module.exports = router;
