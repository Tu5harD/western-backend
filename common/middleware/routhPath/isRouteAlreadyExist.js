const { globalError } = require("../../../errors/globalError");
const Route = require("../../../model/routePath/route");

const isRouteAlreadyExist = async (req, res, next) => {
  try {
    const { route_from, route_to } = req.body;
    const route = await Route.count({
      where: {
        route_from: route_from.toLowerCase(),
        route_to: route_to.toLowerCase(),
      },
    });
    if (route > 0) {
      return next(globalError(401, "Route Already Present"));
    }
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isRouteAlreadyExist };
