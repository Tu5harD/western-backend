const { Op } = require("sequelize");
const Route = require("../../../../../model/routePath/route");
const { globalError } = require("../../../../../errors/globalError");

const getAllRoutes = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status = "" } = req.query;
    const condition = {
      [Op.and]: [{ route_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ route_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            route_from: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            route_to: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }
    const routes = await Route.findAndCountAll({
      where: { ...condition },
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (routes?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Routes not Created",
      });
    }
    const data = routes?.rows.map((obj) => {
      const { route_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: routes.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllRoutesWithoutPagination = async (req, res, next) => {
  try {
    const routes = await Route.findAndCountAll({
      attributes: ["route_from", "route_to", "route_id"],
    });
    if (routes?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Routes not Created",
      });
    }
    const data = routes?.rows.map((obj) => {
      const { ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { getAllRoutes, getAllRoutesWithoutPagination };
