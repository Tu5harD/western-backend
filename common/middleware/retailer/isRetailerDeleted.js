const { globalError } = require("../../../errors/globalError");

const isRetailerDeleted = async (req, res, next) => {
  try {
    const { retailer_deleted } = req.retailer;
    if (retailer_deleted) {
      return next(globalError(406, "Retailer has been already deleted"));
    } else {
      return next();
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isRetailerDeleted };
