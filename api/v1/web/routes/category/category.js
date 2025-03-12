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
  newCategoryRegistration,
} = require("../../components/category/register");
const {
  getAllCategoryAsOptions,
  getAllCategoryByVendorId,
  getAllCategory,
} = require("../../components/category/fetch");
const {
  updateCategoryByCategoryId,
} = require("../../components/category/update");
const {
  deleteCategoryByCategoryId,
} = require("../../components/category/delete");
const {
  isCategoryExistsById,
} = require("../../../../../common/middleware/category/isCategoryExist");
const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isCategoryExistsById,
  newCategoryRegistration
);

router.post(
  "/all",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllCategoryByVendorId
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateCategoryByCategoryId
);
router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllCategoryAsOptions
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deleteCategoryByCategoryId
);

router.get("/all", tokenValidator, tokenTypeValidatorAdmin, getAllCategory);
module.exports = router;
