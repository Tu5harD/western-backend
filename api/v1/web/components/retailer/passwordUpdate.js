const bcrypt = require("bcryptjs");
const { globalError } = require("../../../../../errors/globalError");
const Retailer = require("../../../../../model/retailer/retailer");

const retailerPasswordUpdate = async (req, res, next) => {
  try {
    const { password, retailer_id } = req.body;
    const isPasswordCorrect = await bcrypt.compare(
      req.body.admin_password,
      req.password
    );
    console.log("hi");
    if (!isPasswordCorrect) {
      return next(globalError(500, "Your Password Incorrect"));
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const value = {
      password: hashPassword,
    };
    const retailer = await Retailer.update(value, {
      where: {
        retailer_id,
      },
    });
    if (retailer[0] === 0) {
      return next(globalError(404, "Executive not found"));
    }
    return res.status(200).json({
      success: true,
      message: "Password successfully updated",
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { retailerPasswordUpdate };
