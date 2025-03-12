const { globalError } = require("../../../errors/globalError");
const Executive = require("../../../model/executive/executive");

const isExecutiveExistsById = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    const isExecutiveExist = await Executive.findOne({
      where: {
        executive_id,
      },
    });
    if (!isExecutiveExist) {
      return next(globalError(406, "Executive not found"));
    }
    req.executive = isExecutiveExist.toJSON();
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isExecutiveExistsById };
