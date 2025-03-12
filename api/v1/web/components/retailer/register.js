const bcrypt = require("bcryptjs");
const getUniqueUsername = require("../../../../../helper/username/getUniqueUserName");
const { globalError } = require("../../../../../errors/globalError");
const Retailer = require("../../../../../model/retailer/retailer");

const newRetailerRegistration = async (req, res, next) => {
  try {
    const {
      retailer_name,
      retailer_mobile,
      retailer_address,
      retailer_gst_no,
      retailer_gst_type,
      retailer_fssai,
      retailer_route,
      retailer_village,
      type,
    } = req.body;
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const uniqueUsername = await getUniqueUsername("RT", "Retailer");
    const value = {
      retailer_username: uniqueUsername,
      retailer_name,
      retailer_mobile,
      retailer_address,
      password: hashPassword,
      retailer_gst_no,
      retailer_gst_type,
      retailer_fssai,
      route_id: Number(retailer_route),
      village_id: Number(retailer_village),
      type,
    };
    const retailer = await Retailer.create(value);
    if (!retailer) {
      return next(globalError(500, "Something went wrong"));
    }
    await retailer.save();
    const { password, retailer_deleted, ...createdRetailer } =
      retailer.toJSON();
    return res.status(201).json({
      success: true,
      data: createdRetailer,
      message: `Retailer successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newRetailerRegistration };
