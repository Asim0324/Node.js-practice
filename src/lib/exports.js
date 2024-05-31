const PAGE_SIZE = 20
const numberOfSaltRounds = 10;
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 2
const resendEmailTime = 2;
const port = process.env.PORT || 3001;
const databaseUrl = process.env.DB_URL || "";

module.exports = {
    PAGE_SIZE,
    numberOfSaltRounds,
    MAX_LOGIN_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES,
    resendEmailTime,
    port,
    databaseUrl,
}
