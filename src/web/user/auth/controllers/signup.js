const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../../../models/user");
const { jwtTokenSecret, numberOfSaltRounds } = require("../../../../lib/exports");

const { signupValidation } = require("../../../../validation");
const { StatusCodes } = require("http-status-codes")


const signup = async (req, res) => {

  try {
    const { error, value } = signupValidation.validate(req.body);
    if (error) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        error: error.details[0].message,
        success: false,
        token: null,
        user: null,
        Joi: "Joi schema error. error in front-end payload."
      });
    }
    const old = await User.findOne({ email: value.email });
    if (old) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "This email is already registered",
        token: null,
        user: null,
      });
    }
    const hash = await bcrypt.hash(value.password, numberOfSaltRounds);
    const data = Object.assign({}, value, { password: hash });
    const user = new User(data);
    await user.save();
    const newUser = await User.findById(user._id);
    const token = jwt.sign({ userId: newUser?._id }, jwtTokenSecret);
    const localUser = newUser.toJSON();
    delete localUser.password;
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Thank you for creating an account!",
      token,
      user: localUser,
    });
  } catch (error) {
    console.log(error);
    const message = error.message || "We are working to fix this problem";
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `server error:  ${message}`,
      token: null,
      user: null,
      success: false
    });
  }
};
module.exports = {
  signup,
};