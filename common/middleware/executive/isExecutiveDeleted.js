const { globalError } = require("../../../errors/globalError");

const isExecutiveDeleted = async (req, res, next) => {
  try {
    const { executive_deleted } = req.executive;
    if (executive_deleted) {
      return next(globalError(406, "Executive has been already deleted"));
    } else {
      return next();
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isExecutiveDeleted };
