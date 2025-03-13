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
  isOrderExitsById,
} = require("../../../../../common/middleware/order/isOrderExistById");
const {
  newOrderRegistration,
  orderListRegister,
  spareOrderListRegister
} = require("../../components/order/register");
const {
  updateOrderMaster,
  updateOrderList,
} = require("../../components/order/update");
const {
  registerLedgerByOrderConfirmation,
} = require("../../components/retailerLedger/register");
const {
  updateOrderByOrderConfirmation,
} = require("../../components/order/update");
const { deleteOrder } = require("../../components/order/delete");
const {
  fetchAllOrder,
  fetchOrderDetailsById,
  fetchAllOrderCreatedByExecutive,
  fetchAllOrderCreatedByRetailer,
} = require("../../components/order/fetch");

const {
  stockUpdateWhenOrderConfirmed,
  stockUpdateWhenOrderConfirmedd,
} = require("../../components/stock/update");

const { billRegister } = require("../../components/bill/register");
const { updateOrderBill } = require("../../components/bill/update");

const router = express.Router();

router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllOrder
);

router.get(
  "/executive/:id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllOrderCreatedByExecutive
);

router.get(
  "/retailer/:id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllOrderCreatedByRetailer
);

router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchOrderDetailsById
);

router.post(
  "/confirm",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isOrderExitsById,
  updateOrderByOrderConfirmation,
  stockUpdateWhenOrderConfirmedd,
  registerLedgerByOrderConfirmation
);

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newOrderRegistration,
  billRegister,
  orderListRegister,
  spareOrderListRegister,
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateOrderMaster,
  updateOrderBill,
  updateOrderList
);

router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deleteOrder
);

module.exports = router;
