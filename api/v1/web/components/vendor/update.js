const { globalError } = require("../../../../../errors/globalError");
const Vendor = require("../../../../../model/vendor/vendor");

const updateVendorDetailsByVendorId = async (req, res, next) => {
  try {
    const {
      vendor_name,
      vendor_mobile,
      vendor_address,
      vendor_fssai,
      vendor_gst_no,
      vendor_gst_type,
      vendor_status,
      vendor_id,
    } = req.body;

    const value = {
      vendor_name,
      vendor_mobile,
      vendor_address,
      vendor_fssai,
      vendor_gst_no,
      vendor_gst_type,
      vendor_status,
    };

    const vendor = await Vendor.update(value, {
      where: {
        vendor_id,
      },
    });

    if (vendor[0] === 0) {
      return next(globalError(404, "vendor not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Vendor successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateVendorDetailsByVendorId };
