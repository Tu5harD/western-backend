const { globalError } = require("../../../../../errors/globalError");
const Route = require("../../../../../model/routePath/route");

const deleteRouteByRouteId = async (req, res, next) => {
  try {
    const { route_id } = req.body;
    const value = {
      route_deleted: true,
    };
    const deletedRoute = await Route.update(value, {
      where: {
        route_id,
      },
    });
    if (deletedRoute[0] === 0) {
      return next(globalError(404, "Route not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Route successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteRouteByRouteId };
