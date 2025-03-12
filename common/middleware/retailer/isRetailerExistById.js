const { globalError } = require("../../../errors/globalError");
const Retailer = require("../../../model/retailer/retailer");

const isRetailerExistsById = async (req, res, next) => {
  try {
    const { retailer_id } = req.body;
    const isRetailerExist = await Retailer.findOne({
      where: {
        retailer_id,
      },
    });
    if (!isRetailerExist) {
      return next(globalError(406, "Retailer not found"));
    }
    req.retailer = isRetailerExist.toJSON();
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isRetailerExistsById };
