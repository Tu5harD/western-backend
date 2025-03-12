const express = require("express");
const {
  tokenValidator,
} = require("../../../../../common/middleware/token/tokenValidator");
const {
  tokenTypeAndroidValidatorRetailer,
} = require("../../../../../common/middleware/token/tokenTypeValidator");
const {
  isTokenUserExists,
} = require("../../../../../common/middleware/token/isTokenUserExists");
const {
  fetchAllLedgerByRetailerIdAndAuthority,
} = require("../../components/ledger/fetch");

const router = express.Router();

router.post(
  "/id",
  tokenValidator,
  tokenTypeAndroidValidatorRetailer,
  isTokenUserExists,
  fetchAllLedgerByRetailerIdAndAuthority
);

module.exports = router;
