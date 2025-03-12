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
  newExecutiveRegistration,
} = require("../../components/executive/register");
const {
  villageAllocationToExecutive,
} = require("../../components/executive/villageAllot");
const {
  getAllExecutive,
  getExecutiveById,
  getAllVillagesAllotedToExecutive,
  getExecutiveTargetById,
} = require("../../components/executive/fetch");
const {
  executivePasswordUpdate,
} = require("../../components/executive/passwordUpdate");

const {
  isExecutiveExistsById,
} = require("../../../../../common/middleware/executive/isExecutiveExistById");
const {
  isExecutiveDeleted,
} = require("../../../../../common/middleware/executive/isExecutiveDeleted");
const {
  updateExecutiveDetailsByExecutiveId,
  updateExecutiveTarget,
} = require("../../components/executive/update");
const {
  deleteExecutiveByExecutiveId,
} = require("../../components/executive/delete");
const {
  fetchUserPassword,
} = require("../../../../../common/middleware/executive/isPasswordMatch");
const router = express.Router();

//isDepartmentExistsById, isDepartmentDeleted,

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newExecutiveRegistration
);
router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllExecutive
);
router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getExecutiveById
);
router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isExecutiveExistsById,
  isExecutiveDeleted,
  updateExecutiveDetailsByExecutiveId
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isExecutiveExistsById,
  isExecutiveDeleted,
  deleteExecutiveByExecutiveId
);
router.put(
  "/password/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  fetchUserPassword,
  executivePasswordUpdate
);

router.put(
  "/village/allot/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  villageAllocationToExecutive
);

router.post(
  "/village/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllVillagesAllotedToExecutive
);

router.put(
  "/target/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateExecutiveTarget
);

router.post(
  "/target",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getExecutiveTargetById
);

module.exports = router;
