const { Op } = require("sequelize");
const Retailer = require("../../../../../model/retailer/retailer");
const { globalError } = require("../../../../../errors/globalError");

const updateReminderByRetailerId = async (req, res, next) => {
  try {
    const { last_date = "", note = "", retailer_id } = req.body;

    const value = {
      last_date,
      note,
    };

    const retailer = await Retailer.update(value, {
      where: {
        retailer_id: Number(retailer_id),
      },
    });

    if (!retailer) {
      return res.status(200).json({
        success: false,
        message: "Reminder Not Added",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reminder Successfully Added",
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = {
  updateReminderByRetailerId,
};
