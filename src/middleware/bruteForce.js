const { StatusCodes } = require("http-status-codes");

const failedLoginAttempts = {};

const bruteForce = (limit) => (req, res, next) => {
    const ipAddress = req.ip;

    if (failedLoginAttempts[ipAddress] >= limit) {
        const lockoutTime = failedLoginAttempts[`${ipAddress}_lockout`];
        const currentTime = new Date().getTime();
        if (currentTime < lockoutTime) {
            const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000 / 60);
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                success: false,
                message: `Too many login attempts. Please try again after ${remainingTime} minutes.`,
                user: null
            });
        } else {
            delete failedLoginAttempts[ipAddress];
            delete failedLoginAttempts[`${ipAddress}_lockout`];
        }
    }

    next();
};

const trackFailedAttempt = (ipAddress, limit, duration) => {
    failedLoginAttempts[ipAddress] = (failedLoginAttempts[ipAddress] || 0) + 1;

    if (failedLoginAttempts[ipAddress] >= limit) {
        failedLoginAttempts[`${ipAddress}_lockout`] = new Date().getTime() + duration * 60 * 1000;
    }
};

module.exports = {
    bruteForce,
    trackFailedAttempt
};
