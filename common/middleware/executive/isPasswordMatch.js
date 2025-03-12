const jwt = require("jsonwebtoken");
const { globalError } = require("../../../errors/globalError");
const Admin = require("../../../model/admin");

const fetchUserPassword = async (req, res, next) => {
  try {
    const { admin_id } = req.authData?.user;

    const user = await Admin.findOne({
      where: { admin_id: admin_id },
    });
    if (!user) {
      return next(globalError(401, "User not Exist"));
    } else {
      req.password = user.password;
      return next();
    }
  } catch (error) {
    console.log(req.authData.user);
    return next(globalError(401, error.message));
  }
};

module.exports = { fetchUserPassword };
