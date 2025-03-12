const { globalError } = require("../../../../../errors/globalError");
const Executive = require("../../../../../model/executive/executive");

const deleteExecutiveByExecutiveId = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    const value = {
      executive_deleted: true,
    };
    const deletedExecutive = await Executive.update(value, {
      where: {
        executive_id,
      },
    });
    if (deletedExecutive[0] === 0) {
      return next(globalError(404, "Executive not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Executive successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deleteExecutiveByExecutiveId };
