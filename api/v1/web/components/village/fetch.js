const { Op } = require("sequelize");
const Village = require("../../../../../model/village/village");
const Route = require("../../../../../model/routePath/route");
const { globalError } = require("../../../../../errors/globalError");

const getAllVillage = async (req, res, next) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", status } = req.query;
    const condition = {
      [Op.and]: [{ village_deleted: false }],
    };

    if (query.startsWith("#")) {
      condition[Op.and].push({ village_id: Number(query.split("#")[1]) });
    } else {
      condition[Op.and].push({
        [Op.or]: [
          {
            village_name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      });
    }

    const village = await Village.findAndCountAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Route,
          attributes: ["route_from", "route_to"],
        },
      ],
      limit: +pageSize,
      offset: (+pageIndex - 1) * +pageSize,
    });
    if (village?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Village not Created",
      });
    }
    const data = village?.rows.map((obj) => {
      const { village_deleted, ...otherData } = obj.toJSON();
      return otherData;
    });
    return res.status(200).json({ success: true, total: village.count, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllVillageAsOptionsByRouteId = async (req, res, next) => {
  try {
    const village = await Village.findAndCountAll({
      where: {
        village_deleted: false,
        [Op.and]: { route_id: Number(req.params.id) },
      },
    });
    if (village?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "village not Created",
      });
    }
    const data = village?.rows.map((obj) => {
      const { village_name, village_id } = obj.toJSON();
      return { label: village_name, value: village_id };
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

const getAllVillageNames = async (req, res, next) => {
  try {
    const condition = {
      [Op.and]: [{ village_deleted: false }],
    };

    const village = await Village.findAndCountAll({
      where: { ...condition },
    });
    if (village?.rows.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Village not created",
      });
    }
    const data = village?.rows.map((obj) => {
      const { village_deleted, village_name, village_id } = obj.toJSON();
      return { label: village_name, value: village_id };
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  getAllVillage,
  getAllVillageAsOptionsByRouteId,
  getAllVillageNames,
};
