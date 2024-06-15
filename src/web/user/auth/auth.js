const router = require("express").Router();
const verifyToken = require("../../../middleware/verifyToken");
const { bruteForce } = require("../../../middleware/bruteForce");

const { signup } = require("./controllers/signup");
const { Login } = require("./controllers/Login");

router.post("/signup", signup);
router.post("/login", Login);

module.exports = router;
