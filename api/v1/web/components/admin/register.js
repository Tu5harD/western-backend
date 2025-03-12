const bcrypt = require("bcryptjs");
const Admin = require("../../../../../model/admin");
const { globalError } = require("../../../../../errors/globalError");
const { capitalize } = require("../../../../../helper/utils/capitalize");
const getUniqueUsername = require("../../../../../helper/username/getUniqueUserName");

const newAdminRegistration = async (req, res, next) => {
  try {
    const { admin_name, admin_mobile, admin_address, admin_gender } = req.body;
    const hashPassword = await bcrypt.hash(req.body.admin_password, 10);
    const uniqueUsername = await getUniqueUsername("AD", "Admin");
    const value = {
      admin_username: uniqueUsername,
      admin_name: capitalize(admin_name).trim(),
      admin_mobile,
      admin_address,
      password: hashPassword,
      admin_gender,
      admin_added_by: req.authData.authority[0],
      admin_added_by_id:
        req.authData.user[
          String(req.authData.authority[0]).toLowerCase() + "_id"
        ],
    };
    const admin = await Admin.create(value);
    if (!admin) {
      return next(globalError(500, "Something went wrong"));
    }
    await admin.save();
    const { password, admin_deleted, ...createdAdmin } = admin.toJSON();
    return res.status(201).json({
      success: true,
      data: createdAdmin,
      message: `Admin successfully created`,
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { newAdminRegistration };
