const express = require("express");
const {
  isRetailerExistsByMobileNumberLogin,
} = require("../../../../../common/middleware/android/auth/isRetailerExistByMobileNumberLogin");
const { Login } = require("../../components/auth/login");
const router = express.Router();

router.post("/login", isRetailerExistsByMobileNumberLogin, Login);

module.exports = router;
