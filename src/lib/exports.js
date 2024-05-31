const PAGE_SIZE = 20
const jwtTokenSecret = process.env.TOKEN_SECRET
const secKey = process.env.SEC_KEY
const numberOfSaltRounds = 10;
const officialMailEmail = process.env.MAIL_EMAIL
const officialMailPassword = process.env.MAIL_PASSWORD
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 2
const resendEmailTime = 2;

module.exports = {
    jwtTokenSecret,
    PAGE_SIZE,
    secKey,
    numberOfSaltRounds,
    officialMailEmail,
    officialMailPassword,
    MAX_LOGIN_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES,
    resendEmailTime,
}
