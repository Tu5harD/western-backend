const { globalError } = require("../../../../../errors/globalError");
const Village = require("../../../../../model/village/village");

const updateVillageDetailsByVillageId = async (req, res, next) => {
  try {
    const { village_name, route_id, village_id } = req.body;

    const value = {
      village_name: village_name.toLowerCase(),
      route_id,
    };

    const village = await Village.update(value, {
      where: {
        village_id: Number(village_id),
      },
    });

    if (village[0] === 0) {
      return next(globalError(404, "village not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Village successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateVillageDetailsByVillageId };
