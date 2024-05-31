const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { bruteForce } = require("../../../middleware/bruteForce");

const { signup } = require("./controllers/signup")

router.post("/signup", signup);

module.exports = router
