const { globalError } = require("../../../../../errors/globalError");
const Route = require("../../../../../model/routePath/route");

const updateRouteDetailsByRouteId = async (req, res, next) => {
  try {
    const { route_from, route_to, route_id } = req.body;

    const value = {
      route_from: route_from.toLowerCase(),
      route_to: route_to.toLowerCase(),
    };

    const route = await Route.update(value, {
      where: {
        route_id: Number(route_id),
      },
    });

    if (route[0] === 0) {
      return next(globalError(404, "Route not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Route successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateRouteDetailsByRouteId };
