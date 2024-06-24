const router = require("express").Router();
const verifyToken = require("../../../middleware/verifyToken");
const { bruteForce } = require("../../../middleware/bruteForce");

const { signup } = require("./controllers/signup");
const { Login } = require("./controllers/Login");
const { sendOTPToEmail } = require("./controllers/sendOTPToEmail");

router.post("/signup", signup);
router.post("/login", Login);
// OTP using email
router.post("/send-otp-to-email", sendOTPToEmail);

module.exports = router;
