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
  newRetailerRegistration,
} = require("../../components/retailer/register");
const {
  getAllRetailer,
  getAllRetailerWithoutPaginated,
  getAllRetailerWithRetailerId,
  getAllWholesaler,
} = require("../../components/retailer/fetch");
const {
  retailerPasswordUpdate,
} = require("../../components/retailer/passwordUpdate");
const {
  isRetailerExistsById,
} = require("../../../../../common/middleware/retailer/isRetailerExistById");
const {
  isRetailerDeleted,
} = require("../../../../../common/middleware/retailer/isRetailerDeleted");
const {
  fetchUserPassword,
} = require("../../../../../common/middleware/retailer/isPasswordMatch");
const {
  updateRetailerDetailsByRetailerId,
} = require("../../components/retailer/update");
const {
  deleteRetailerByRetailerId,
} = require("../../components/retailer/delete");
const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newRetailerRegistration
);
router.get(
  "/all",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRetailerWithoutPaginated
);
router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRetailer
);

router.post(
  "/wholesaler",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllWholesaler
);
router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRetailerWithRetailerId
);
router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isRetailerExistsById,
  isRetailerDeleted,
  updateRetailerDetailsByRetailerId
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isRetailerExistsById,
  isRetailerDeleted,
  deleteRetailerByRetailerId
);
router.put(
  "/password/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchUserPassword,
  retailerPasswordUpdate
);
module.exports = router;
