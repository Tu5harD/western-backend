const Admin = require("../../../model/admin");
const role = require("../../../constants/role");
const { globalError } = require("../../../errors/globalError");
const Executive = require("../../../model/executive/executive");
const Retailer = require("../../../model/retailer/retailer");

const isLoginUserExistsByType = async (req, res, next) => {
  try {
    const userAgent = req.headers["user-agent"];
    const { username, type } = req.body;
    let user;
    if (
      !userAgent.includes("Android") &&
      role[username.split("-")[0]]?.label === "Admin"
    ) {
      user = await Admin.findOne({
        where: {
          admin_username: username,
        },
      });
    }
    if (type === 2) {
      user = await Executive.findOne({
        where: {
          executive_username: username,
        },
      });
    }
    if (type === 3) {
      user = await Retailer.findOne({
        where: {
          retailer_username: username,
        },
      });
    }
    if (!user) {
      return next(
        globalError(404, `${role[username.split("-")[0]].label} not found`)
      );
    }
    req.authority = [String(role[username.split("-")[0]].label).toLowerCase()];
    req.user = user.toJSON();
    return next();
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { isLoginUserExistsByType };
