const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { globalError } = require("../../../../../errors/globalError");

const Login = async (req, res, next) => {
  try {
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      req?.userData.password
    );

    if (!isPasswordCorrect) {
      return next(globalError(401, "Invalid Credentials"));
    }
    const { password, ...value } = req?.userData;
    const token = jwt.sign(
      { user: { ...value }, authority: req.authority },
      process.env.PRIVATEKEY,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      token,
      data: { ...value },
      authority: req.authority,
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = { Login };
