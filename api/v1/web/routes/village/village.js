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
const { newVillageRegistration } = require("../../components/village/register");
const {
  getAllVillage,
  getAllVillageAsOptionsByRouteId,
  getAllVillageNames,
} = require("../../components/village/fetch");
const {
  updateVillageDetailsByVillageId,
} = require("../../components/village/update");
const {
  deletedVillageByVillageId,
} = require("../../components/village/delete");
const {
  isVillageExistsById,
} = require("../../../../../common/middleware/village/isVillageAlreadyExist");

const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isVillageExistsById,
  newVillageRegistration
);
router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVillage
);
router.get(
  "/names",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVillageNames
);

router.get(
  "/options/:id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVillageAsOptionsByRouteId
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateVillageDetailsByVillageId
);

router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deletedVillageByVillageId
);

module.exports = router;
