const { globalError } = require("../../../errors/globalError");
const Village = require("../../../model/village/village");

const isVillageExistsById = async (req, res, next) => {
  try {
    const { village_name } = req.body;
    const isVillageExist = await Village.findOne({
      where: {
        village_name: village_name.toLowerCase(),
      },
    });
    if (isVillageExist) {
      return next(globalError(406, "Village Already Exist"));
    }
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isVillageExistsById };
