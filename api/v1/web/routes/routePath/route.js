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
const { newRouteRegistration } = require("../../components/routePath/register");
const {
  updateRouteDetailsByRouteId,
} = require("../../components/routePath/update");
const { deleteRouteByRouteId } = require("../../components/routePath/delete");
const {
  getAllRoutes,
  getAllRoutesWithoutPagination,
} = require("../../components/routePath/fetch");
const {
  isRouteAlreadyExist,
} = require("../../../../../common/middleware/routhPath/isRouteAlreadyExist");

const router = express.Router();

router.post(
  "/register",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  isRouteAlreadyExist,
  newRouteRegistration
);

router.get(
  "/",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRoutes
);

router.get(
  "/all",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  getAllRoutesWithoutPagination
);

router.put(
  "/update/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  updateRouteDetailsByRouteId
);

router.delete(
  "/delete/id",
  tokenValidator,
  tokenTypeValidatorAdmin,
  isTokenUserExists,
  deleteRouteByRouteId
);

module.exports = router;
