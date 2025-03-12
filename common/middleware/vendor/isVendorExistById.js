const { globalError } = require("../../../errors/globalError");
const Vendor = require("../../../model/vendor/vendor");

const isVendorExistsById = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    const isVendorExist = await Vendor.findOne({
      where: {
        vendor_id,
      },
    });
    if (!isVendorExist) {
      return next(globalError(406, "Vendor not found"));
    }
    req.vendor = isVendorExist.toJSON();
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isVendorExistsById };
