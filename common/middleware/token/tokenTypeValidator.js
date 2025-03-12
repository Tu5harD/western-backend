const { globalError } = require("../../../errors/globalError");

const tokenTypeValidatorAdmin = async (req, res, next) => {
  try {
    if (
      req.authData?.authority.includes("admin") ||
      req.authData?.authority.includes("retailer") ||
      req.authData?.authority.includes("executive")
    )
      return next();
    else {
      return next(globalError(401, "You are not authenticated for this data"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const tokenTypeAndroidValidatorRetailer = async (req, res, next) => {
  try {
    if (
      req.authData?.authority.includes("retailer") ||
      req.authData?.authority.includes("executive") ||
      req.authData?.authority.includes("wholesaler")
    )
      return next();
    else {
      return next(globalError(401, "You are not authenticated for this data"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const tokenTypeValidatorEmployee = async (req, res, next) => {
  try {
    if (req.authData?.authority.includes("employee")) return next();
    else {
      return next(globalError(401, "You are not authenticated for this data"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const tokenTypeValidatorGuard = async (req, res, next) => {
  try {
    if (req.authData?.authority.includes("guard")) return next();
    else {
      return next(globalError(401, "You are not authenticated for this data"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const tokenTypeValidatorDepartment = async (req, res, next) => {
  try {
    if (req.authData?.authority.includes("department")) return next();
    else {
      return next(globalError(401, "You are not authenticated for this data"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const tokenTypeValidatorEmployeeOrGuard = async (req, res, next) => {
  try {
    if (
      req.authData?.authority.includes("employee") ||
      req.authData?.authority.includes("guard")
    )
      return next();
    else {
      return next(globalError(401, "You are not authenticated for this data"));
    }
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  tokenTypeValidatorAdmin,
  tokenTypeValidatorEmployee,
  tokenTypeValidatorGuard,
  tokenTypeValidatorDepartment,
  tokenTypeValidatorEmployeeOrGuard,
  tokenTypeAndroidValidatorRetailer,
};
