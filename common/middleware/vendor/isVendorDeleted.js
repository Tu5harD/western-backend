const { globalError } = require("../../../errors/globalError");

const isVendorDeleted = async (req, res, next) => {
  try {
    const { vendor_deleted } = req.vendor;
    if (vendor_deleted) {
      return next(globalError(406, "Vendor has been already deleted"));
    } else {
      return next();
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isVendorDeleted };
