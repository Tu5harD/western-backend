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
const { getProfitAndLoss } = require("../../components/transaction/fetch");
const {
  billWiseProfitAndLoss,
  productWiseProfitAndLoss,
  partyOverallPendingBalance,
} = require("../../components//BillWiseProfitAndLoss/fetch");

const router = express.Router();

router.get(
  "/profitorloss",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getProfitAndLoss
);
router.get(
  "/bill/profitorloss",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  billWiseProfitAndLoss
);

router.get(
  "/product/profitorloss",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  productWiseProfitAndLoss
);

router.get(
  "/party/pending/balance",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  partyOverallPendingBalance
);

module.exports = router;
