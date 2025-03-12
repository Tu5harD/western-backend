const { globalError } = require("../../../../../errors/globalError");
const Village = require("../../../../../model/village/village");

const newVillageRegistration = async (req, res, next) => {
  try {
    const { village_name, route_id } = req.body;
    const value = {
      village_name: village_name.toLowerCase(),
      route_id,
    };
    const village = await Village.create(value);
    if (!village) {
      return next(globalError(500, "Something went wrong"));
    }
    await village.save();
    const { village_deleted, ...createdVillage } = village.toJSON();
    return res.status(201).json({
      success: true,
      data: createdVillage,
      message: `Village successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newVillageRegistration };
