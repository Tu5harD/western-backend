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
const { newProductRegistration } = require("../../components/product/register");
const {
  getAllProducts,
  getAllProductsAsOptions,
  getAllProductsAsOptionsByCategoryIdStock,
  getAllProductsByVendorId,
} = require("../../components/product/fetch");
const {
  updateProductDetailsByProductId,
} = require("../../components/product/update");

const { newStockRegistration } = require("../../components/stock/register");
const { deleteProductByProductId } = require("../../components/product/delete");
const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newProductRegistration,
  newStockRegistration
);
router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllProducts
);
router.post(
  "/all",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllProductsAsOptions
);
router.post(
  "/options",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllProductsAsOptionsByCategoryIdStock
);
router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateProductDetailsByProductId
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deleteProductByProductId
);

router.post(
  "/vendor/:id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllProductsByVendorId
);

module.exports = router;
