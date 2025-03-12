const { globalError } = require("../../../../../errors/globalError");
const Admin = require("../../../../../model/admin");

const updateAdmintoken = async (req, res, next) => {
  try {
    const { token, admin_id } = req.body;

    const value = {
      token,
    };

    const admin = await Admin.update(value, {
      where: {
        admin_id,
      },
    });

    if (admin[0] === 0) {
      return next(globalError(404, "Admin not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Admin successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

module.exports = { updateAdmintoken };
