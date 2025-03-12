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
const { newVendorRegistration } = require("../../components/vendor/register");
const {
  getAllVendor,
  getAllVendorAsOptions,
  getAllVendorWithoutPaginated,
  getVendorById,
  getVendorProductsById,
} = require("../../components/vendor/fetch");
const {
  isVendorExistsById,
} = require("../../../../../common/middleware/vendor/isVendorExistById");
const {
  isVendorDeleted,
} = require("../../../../../common/middleware/vendor/isVendorDeleted");
const {
  updateVendorDetailsByVendorId,
} = require("../../components/vendor/update");
const { deletedVendorByVendorId } = require("../../components/vendor/delete");
const router = express.Router();

//isDepartmentExistsById, isDepartmentDeleted,

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newVendorRegistration
);
router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVendor
);
router.get(
  "/all",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVendorWithoutPaginated
);
router.get(
  "/options",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVendorAsOptions
);
router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getVendorById
);
router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isVendorExistsById,
  isVendorDeleted,
  updateVendorDetailsByVendorId
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isVendorExistsById,
  isVendorDeleted,
  deletedVendorByVendorId
);

router.post(
  "/products/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getVendorProductsById
);
module.exports = router;
