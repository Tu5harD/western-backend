const Retailer = require("../../../../model/retailer/retailer");
const Executive = require("../../../../model/executive/executive");
const { globalError } = require("../../../../errors/globalError");
// const role = require("../../../../constants/role");

const isRetailerExistsByMobileNumberLogin = async (req, res, next) => {
  try {
    const mobile = req.body.mobile;

    const retailer = await Retailer.findOne({
      where: {
        retailer_mobile: mobile,
      },
    });

    const executive = await Executive.findOne({
      where: {
        executive_mobile: mobile,
      },
    });

    if (!retailer && !executive) {
      return next(globalError(404, "User not found"));
    }
    if (retailer) {
      req.userData = retailer.dataValues;
      req.authority = [retailer?.type];
    }
    if (executive) {
      req.userData = executive.dataValues;
      req.authority = ["executive"];
    }
    // req.authority = [String(role[username.split("-")[0]].label).toLowerCase()];

    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isRetailerExistsByMobileNumberLogin };
