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
const { newStockRegistration } = require("../../components/stock/register");
const { getAllStock } = require("../../components/stock/fetch");
const {
  updateStockDetailsByStockId,
} = require("../../components/stock/update");
const { deleteStockByStockId } = require("../../components/stock/delete");
const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newStockRegistration
);
router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllStock
);
router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateStockDetailsByStockId
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deleteStockByStockId
);

module.exports = router;
