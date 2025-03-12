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
  isPurchaseOrderProductArrayExists,
} = require("../../../../../common/middleware/product/isPurchaseOrderArrayExist");
const {
  isOrderExitsById,
  isPurchaseOrderExitsById,
} = require("../../../../../common/middleware/order/isOrderExistById");
const {
  newPurchaseOrderRegistration,
  PurchaseOrderListRegister,
} = require("../../components/purchaseOrder/register");
const {
  registerVendorLedgerByOrderConfirmation,
} = require("../../components/vendorLedger/register");
const {
  updatePurchaseOrderByOrderConfirmation,
  updatePOList,
  updatePOMaster,
} = require("../../components/purchaseOrder/update");
const {
  fetchAllPurchaseOrder,
  fetchPurchaseOrderDetailsById,
} = require("../../components/purchaseOrder/fetch");

const {
  stockUpdateWhenPurchaseOrderRegister,
} = require("../../components/stock/update");

const {
  billRegister,
  PurchaseBillRegister,
} = require("../../components/bill/register");

const { deletePO } = require("../../components/purchaseOrder/delete");
const { updatePOBill } = require("../../components/bill/update");

const router = express.Router();

router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchAllPurchaseOrder
);

router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchPurchaseOrderDetailsById
);

router.post(
  "/confirm",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isPurchaseOrderExitsById,
  updatePurchaseOrderByOrderConfirmation,
  stockUpdateWhenPurchaseOrderRegister,
  registerVendorLedgerByOrderConfirmation
);

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newPurchaseOrderRegistration,
  PurchaseBillRegister,
  PurchaseOrderListRegister
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isPurchaseOrderProductArrayExists,
  updatePOMaster,
  updatePOBill,
  updatePOList
);

router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deletePO
);

module.exports = router;
