const { globalError } = require("../../../../../errors/globalError");
const Route = require("../../../../../model/routePath/route");

const newRouteRegistration = async (req, res, next) => {
  try {
    const { route_from, route_to } = req.body;

    const value = {
      route_from: route_from.toLowerCase(),
      route_to: route_to.toLowerCase(),
    };

    const route = await Route.create(value);
    if (!route) {
      return next(globalError(500, "Something went wrong"));
    }
    await route.save();
    const { route_deleted, ...createdRoute } = route.toJSON();
    return res.status(201).json({
      success: true,
      data: createdRoute,
      message: `Route successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newRouteRegistration };
