const { globalError } = require("../../../../../errors/globalError");
const Village = require("../../../../../model/village/village");

const deletedVillageByVillageId = async (req, res, next) => {
  try {
    const { village_id } = req.body;
    const value = {
      village_deleted: true,
    };
    const deletedVillage = await Village.update(value, {
      where: {
        village_id,
      },
    });
    if (deletedVillage[0] === 0) {
      return next(globalError(404, "Village not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Village successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deletedVillageByVillageId };
