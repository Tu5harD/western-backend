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
  isReturnProductArrayExists,
} = require("../../../../../common/middleware/product/isReturnProductArrayExist");
const {
  isOrderExitsById,
  isReturnOrderExitsById,
} = require("../../../../../common/middleware/order/isOrderExistById");
const {
  newReturnOrderRegistration,
  ReturnorderListRegister,
} = require("../../components/returnOrder/register");
const {
  updateReturnOrderByOrderConfirmation,
} = require("../../components/returnOrder/update");
const {
  updateLedgerWhenOrderReturn,
} = require("../../components/retailerLedger/update");
const {
  updateOrderByOrderConfirmation,
} = require("../../components/order/update");
const {
  fetchAllOrder,
  fetchOrderDetailsById,
} = require("../../components/order/fetch");
const {
  fetchAllReturnOrder,
  fetchReturnOrderDetailsById,
} = require("../../components/returnOrder/fetch");
const { deleteReturnOrder } = require("../../components/returnOrder/delete");

const {
  updateStockWhenReturnOrderRegister,
} = require("../../components/stock/fetch");
const {
  stockUpdateWhenReturnOrderRegister,
} = require("../../components/stock/update");

const { ReturnbillRegister } = require("../../components/bill/register");

const router = express.Router();

router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllReturnOrder
);

router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchReturnOrderDetailsById
);

router.post(
  "/confirm",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isReturnOrderExitsById,
  updateReturnOrderByOrderConfirmation,
  stockUpdateWhenReturnOrderRegister,
  updateLedgerWhenOrderReturn
);

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newReturnOrderRegistration,
  ReturnbillRegister,
  ReturnorderListRegister
);

router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deleteReturnOrder
);

module.exports = router;
