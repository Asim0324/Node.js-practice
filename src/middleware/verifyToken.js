const jwt = require("jsonwebtoken");
const { jwtTokenSecret } = require("../lib/exports");
const { StatusCodes } = require("http-status-codes");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  try {
    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "No token provided" });
    }

    if (!token.startsWith("Bearer ")) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid token format. It should be a Bearer token" });
    }

    const tokenWithoutBearer = token.split(" ")[1];

    jwt.verify(tokenWithoutBearer, jwtTokenSecret, (err, decoded) => {
      if (err) {
        console.error("Error verifying token: ", err);

        if (err.name === "TokenExpiredError") {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Token has expired" });
        }

        if (
          err.name === "JsonWebTokenError" &&
          err.message === "invalid signature"
        ) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Invalid token signature" });
        }

        console.error("Unexpected error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Internal server error",
        });
      }

      req.decodedToken = decoded?.userId;
      req.userId = decoded?.userId;
      const user = { id: decoded?.userId };
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in verify Bearer Token middleware: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

module.exports = verifyToken;
