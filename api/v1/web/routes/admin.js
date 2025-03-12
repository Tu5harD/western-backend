const express = require("express");
const {
  tokenValidator,
} = require("../../../../common/middleware/token/tokenValidator");
const {
  isTokenUserExists,
} = require("../../../../common/middleware/token/isTokenUserExists");
const {
  tokenTypeValidatorAdmin,
} = require("../../../../common/middleware/token/tokenTypeValidator");
const { newAdminRegistration } = require("../components/admin/register");
const { getAllAdmin } = require("../components/admin/fetch");
const { updateAdmintoken } = require("../components/admin/update");
const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newAdminRegistration
);
router.post(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllAdmin
);

router.put(
  "/token/update",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateAdmintoken
);

module.exports = router;
