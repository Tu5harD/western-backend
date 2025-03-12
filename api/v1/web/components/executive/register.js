const bcrypt = require("bcryptjs");
const getUniqueUsername = require("../../../../../helper/username/getUniqueUserName");
const { globalError } = require("../../../../../errors/globalError");
const Executive = require("../../../../../model/executive/executive");

const newExecutiveRegistration = async (req, res, next) => {
  try {
    const {
      executive_name,
      executive_mobile,
      executive_address,
      executive_gender,
    } = req.body;
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const uniqueUsername = await getUniqueUsername("Ex", "Executive");
    const value = {
      executive_username: uniqueUsername,
      executive_name,
      executive_mobile,
      executive_address,
      password: hashPassword,
      executive_gender,
    };
    const executive = await Executive.create(value);
    if (!executive) {
      return next(globalError(500, "Something went wrong"));
    }
    await executive.save();
    const { password, executive_deleted, ...createdExecutive } =
      executive.toJSON();
    return res.status(201).json({
      success: true,
      data: createdExecutive,
      message: `Executive successfully created`,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newExecutiveRegistration };
