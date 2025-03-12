const { globalError } = require("../../../../../errors/globalError");
const { Op } = require("sequelize");
const VillageAlloted = require("../../../../../model/village/villageAlloted");

const villageAllocationToExecutive = async (req, res, next) => {
  try {
    const { village_id, executive_id, status } = req.body;

    const findVillage = await VillageAlloted.findOne({
      where: {
        executive_id: Number(executive_id),
        [Op.and]: { village_id: Number(village_id) },
      },
    });

    if (findVillage) {
      const updateVillag = await VillageAlloted.update(
        {
          status: status,
        },
        {
          where: {
            village_alloted_id: findVillage.village_alloted_id,
          },
        }
      );
      if (updateVillag) {
        return res.status(201).json({
          success: true,
          data: updateVillag,
          message: `Village Allocated To Executive Successfully`,
        });
      }
    } else {
      const village = await VillageAlloted.create({
        village_id,
        executive_id: Number(executive_id),
        status: status,
      });
      if (!village) {
        return next(globalError(500, "Something went wrong"));
      }
      await village.save();
      const { ...createdData } = village.toJSON();
      return res.status(201).json({
        success: true,
        data: createdData,
        message: `Village Allocated Successfully`,
      });
    }
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { villageAllocationToExecutive };
