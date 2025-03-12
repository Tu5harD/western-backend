const { globalError } = require("../../../../../errors/globalError");
const Vendor = require("../../../../../model/vendor/vendor");

const newVendorRegistration = async (req, res, next) => {
  try {
    const {
      vendor_name,
      vendor_mobile,
      vendor_address,
      vendor_fssai,
      vendor_gst_no,
      vendor_gst_type,
    } = req.body;
    const value = {
      vendor_name,
      vendor_mobile,
      vendor_address,
      vendor_fssai,
      vendor_gst_no,
      vendor_gst_type,
    };
    const vendor = await Vendor.create(value);
    if (!vendor) {
      return next(globalError(500, "Something went wrong"));
    }
    await vendor.save();
    const { password, vendor_deleted, ...createdVendor } = vendor.toJSON();
    return res.status(201).json({
      success: true,
      data: createdVendor,
      message: `Vendor successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newVendorRegistration };
