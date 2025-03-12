const { globalError } = require("../../../../../errors/globalError");
const Vendor = require("../../../../../model/vendor/vendor");

const deletedVendorByVendorId = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    const value = {
      vendor_deleted: true,
    };
    const deletedVendor = await Vendor.update(value, {
      where: {
        vendor_id,
      },
    });
    if (deletedVendor[0] === 0) {
      return next(globalError(404, "Vendor not deleted"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor successfully deleted" });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { deletedVendorByVendorId };
