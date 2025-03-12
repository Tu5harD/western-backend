const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { globalError } = require("../../../errors/globalError");
const role = require("../../../constants/role");

const userLogin = async (req, res, next) => {
  try {
    let isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      req?.user.password
    );
    const { username } = req.body;
    if (!isPasswordCorrect) {
      return next(globalError(401, "Invalid Credentials"));
    }
    const { password, ...existUserData } = req.user;
    const token = jwt.sign(
      {
        user: { ...existUserData },
        type: String(role[username.split("-")[0]].label).toLowerCase(),
        authority: req.authority,
      },
      process.env.PRIVATEKEY,
      { expiresIn: "10d" }
    );

    res.status(200).json({
      success: true,
      token,
      data: { ...existUserData },
      authority: req.authority,
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { userLogin };
