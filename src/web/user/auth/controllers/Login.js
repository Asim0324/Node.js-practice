const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../../../models/user");
const {
  jwtTokenSecret,
  numberOfSaltRounds,
} = require("../../../../lib/exports");
const { loginValidation } = require("../../../../validation");
const { StatusCodes } = require("http-status-codes");

const { trackFailedAttempt } = require("../../../../middleware/bruteForce");
const Login = async (req, res) => {
  try {
    const { error, value } = loginValidation.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
        success: false,
        token: null,
        user: null,
        joi: "joi schema validation error"
      });
    }
    const { email, password } = value;
    let user = await User.findOne({ email }).lean();
    if (user) {
      const { password: hashedPassword } = user;
      const passCheck = await bcrypt.compare(password, hashedPassword);
      if (passCheck) {
        const token = jwt.sign({ userId: user?._id }, jwtTokenSecret);
        const localUser = { ...user };
        delete localUser.password;
        return res.status(StatusCodes.OK).json({
          success: true,
          message: "Logged in successfully!",
          token: token,
          user: localUser,
        });
      } else {
        trackFailedAttempt(req.ip, 5, 2);
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Wrong password. Please try again.",
          token: null,
          user: null,
        });
      }
    } else {
      trackFailedAttempt(req.ip, 5, 2);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No user found with this email or Username",
        token: null,
        user: null,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    const message = error.message || "We are working to fix this problem";
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message,
      user: null,
      token: null,
      success: false,
      error: "server error",
    });
  }
};
module.exports = { Login };