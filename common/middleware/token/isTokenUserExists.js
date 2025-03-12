const { globalError } = require("../../../errors/globalError");
const Admin = require("../../../model/admin");
const Retailer = require("../../../model/retailer/retailer");
const Executive = require("../../../model/executive/executive");

const isTokenUserExists = async (req, res, next) => {
  try {
    let user;
    if (req.authData.authority.includes("admin")) {
      user = await Admin.findOne({
        where: {
          admin_id: req.authData.user.admin_id,
        },
      });
    } else if (req.authData.authority.includes("retailer")) {
      user = await Retailer.findOne({
        where: {
          retailer_id: req.authData.user.retailer_id,
        },
      });
    } else if (req.authData.authority.includes("executive")) {
      user = await Executive.findOne({
        where: {
          executive_id: req.authData.user.executive_id,
        },
      });
    } else if (req.authData.authority.includes("wholesaler")) {
      user = await Retailer.findOne({
        where: {
          retailer_id: req.authData.user.retailer_id,
        },
      });
    } else if (req.authData.authority.includes("department")) {
      user = await Department.findOne({
        where: {
          department_id: req.authData.user.department_id,
        },
      });
    } else {
      return next(globalError(401, "Invalid token type"));
    }

    if (!user) {
      return next(globalError(401, `User has found`));
    }

    if (
      req.authData.authority.includes("admin") &&
      user.toJSON().admin_deleted === true
    )
      return next(globalError(401, "Admin has been deleted"));
    else if (
      req.authData.authority.includes("retailer") &&
      user.toJSON().retailer_deleted === true
    )
      return next(globalError(401, "Retailer has been deleted"));
    else if (
      req.authData.authority.includes("exeutive") &&
      user.toJSON().executive_deleted === true
    )
      return next(globalError(401, "Executive has been deleted"));
    else if (
      req.authData.authority.includes("department") &&
      user.toJSON().department_deleted === true
    )
      return next(globalError(401, "Department has been deleted"));

    if (
      req.authData.authority.includes("admin") &&
      user.toJSON().admin_status === false
    )
      return next(globalError(401, "You have been deactivated"));
    else if (
      req.authData.authority.includes("employee") &&
      user.toJSON().employee_status === false
    )
      return next(globalError(401, "You have been deactivated"));
    else if (
      req.authData.authority.includes("guard") &&
      user.toJSON().guard_status === false
    )
      return next(globalError(401, "You have been deactivated"));
    else if (
      req.authData.authority.includes("department") &&
      user.toJSON().department_status === false
    )
      return next(globalError(401, "You have been deactivated"));
    else return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isTokenUserExists };
