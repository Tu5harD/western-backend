const bcrypt = require("bcryptjs");
const { globalError } = require("../../../../../errors/globalError");
const Executive = require("../../../../../model/executive/executive");

const executivePasswordUpdate = async (req, res, next) => {
  try {
    const { executive_password, executive_id } = req.body;
    const isPasswordCorrect = await bcrypt.compare(
      req.body.user_password,
      req.password
    );

    if (!isPasswordCorrect) {
      return next(globalError(500, "Your Password Incorrect"));
    }
    const hashPassword = await bcrypt.hash(executive_password, 10);
    const value = {
      password: hashPassword,
    };
    const executive = await Executive.update(value, {
      where: {
        executive_id,
      },
    });
    if (executive[0] === 0) {
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

module.exports = { executivePasswordUpdate };
