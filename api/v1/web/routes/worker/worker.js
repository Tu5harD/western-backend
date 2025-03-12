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
const { newWorkerRegistration } = require("../../components/worker/register");
const {
  getAllWorker,
  getWorkerById,
} = require("../../components/worker/fetch");
const {
  isWorkerExistsById,
} = require("../../../../../common/middleware/worker/isWorkerExistById");
const {
  isWorkerDeleted,
} = require("../../../../../common/middleware/worker/isWorkerDeleted");
const {
  updateWorkerDetailsByWorkerId,
} = require("../../components/worker/update");
const { deletedWorkerByWorkerId } = require("../../components/worker/delete");
const router = express.Router();

//isDepartmentExistsById, isDepartmentDeleted,

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  newWorkerRegistration
);
router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllWorker
);
router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getWorkerById
);
router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isWorkerExistsById,
  isWorkerDeleted,
  updateWorkerDetailsByWorkerId
);
router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isWorkerExistsById,
  isWorkerDeleted,
  deletedWorkerByWorkerId
);
module.exports = router;
