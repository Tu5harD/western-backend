const { globalError } = require("../../../../../errors/globalError");
const Retailer = require("../../../../../model/retailer/retailer");

const updateRetailerDetailsByRetailerId = async (req, res, next) => {
  try {
    const {
      retailer_name,
      retailer_mobile,
      retailer_status,
      retailer_address,
      retailer_gst_no,
      retailer_fssai,
      retailer_gst_type,
      retailer_id,
      retailer_route,
      retailer_village,
      type,
    } = req.body;

    const value = {
      retailer_name,
      retailer_mobile,
      retailer_status,
      retailer_address,
      retailer_gst_no,
      retailer_fssai,
      retailer_gst_type,
      route_id: Number(retailer_route),
      village_id: Number(retailer_village),
      type,
    };

    const retailer = await Retailer.update(value, {
      where: {
        retailer_id,
      },
    });

    if (retailer[0] === 0) {
      return next(globalError(404, "Retailer not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Retailer successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateRetailerDetailsByRetailerId };
