const { globalError } = require("../../../../../errors/globalError");
const Retailer = require("../../../../../model/retailer/retailer");
const Executive = require("../../../../../model/executive/executive");
const bcrypt = require("bcryptjs");

const updateRetailertoken = async (req, res, next) => {
  try {
    const { retailer_token } = req.body;

    const value = {
      retailer_token,
    };

    const admin = await Retailer.update(value, {
      where: {
        retailer_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
      },
    });

    if (admin[0] === 0) {
      return next(globalError(404, "Retailer not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Retailer successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

const updateRetailerWholesalerDetails = async (req, res, next) => {
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
    } = req.body;

    const value = {
      retailer_name,
      retailer_mobile,
      retailer_address,
      retailer_gst_no,
      retailer_gst_type,
      retailer_fssai,
      route_id: Number(retailer_route),
      village_id: Number(retailer_village),
    };

    const admin = await Retailer.update(value, {
      where: {
        retailer_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
      },
    });

    if (admin[0] === 0) {
      return next(globalError(404, "Retailer/wholesaler not found"));
    }
    return res.status(200).json({
      success: true,
      message: "Retailer/wholesaler successfully updated",
    });
  } catch (error) {
    next(globalError(500, error));
  }
};

const updateExecutiveDetails = async (req, res, next) => {
  try {
    const {
      executive_name,
      executive_mobile,
      executive_address,
      executive_gender,
    } = req.body;

    const value = {
      executive_name,
      executive_mobile,
      executive_address,
      executive_gender,
    };

    const admin = await Executive.update(value, {
      where: {
        executive_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
      },
    });

    if (admin[0] === 0) {
      return next(globalError(404, "Executive not found"));
    }
    return res.status(200).json({
      success: true,
      message: "Executive successfully updated",
    });
  } catch (error) {
    next(globalError(500, error));
  }
};

const updatePasswordRetailer = async (req, res, next) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const value = {
      password: hashPassword,
    };

    const retailer = await Retailer.update(value, {
      where: {
        retailer_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
      },
    });

    if (retailer[0] === 0) {
      return next(globalError(404, "Retailer/wholesaler not found"));
    }
    return res.status(200).json({
      success: true,
      message: "Password successfully updated",
    });
  } catch (error) {
    next(globalError(500, error));
  }
};

const updatePasswordExecutive = async (req, res, next) => {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const value = {
      password: hashPassword,
    };

    const retailer = await Executive.update(value, {
      where: {
        executive_id: req?.authData?.user[req?.authData?.authority[0] + "_id"],
      },
    });

    if (retailer[0] === 0) {
      return next(globalError(404, "Excutive not found"));
    }
    return res.status(200).json({
      success: true,
      message: "Password successfully updated",
    });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = {
  updateRetailertoken,
  updateRetailerWholesalerDetails,
  updatePasswordRetailer,
  updatePasswordExecutive,
  updateExecutiveDetails,
};
