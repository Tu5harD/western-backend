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
  WorkerAttendanceRegistration,
} = require("../../components/workerAttendance/register");
const {
  getWorkerAttendanceById,
} = require("../../components/workerAttendance/fetch");
const {
  getTotalAttendanceById,
} = require("../../components/workerAttendance/totalAttendance");
const {
  getMonthlyAttendanceById,
} = require("../../components/workerAttendance/monthlyAttendance");
const {
  isAttendanceAlreadyMarked,
} = require("../../../../../common/middleware/worker/isAttendanceAlreadyMarked");
const router = express.Router();

router.post(
  "/register/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  WorkerAttendanceRegistration
);
router.post(
  "/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getWorkerAttendanceById
);
router.post(
  "/total/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getTotalAttendanceById
);
router.post(
  "/monthly/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getMonthlyAttendanceById
);
module.exports = router;
