const { StatusCodes } = require("http-status-codes");
const { User } = require("../../../../models/user");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const { officialMailPassword, officialMailEmail } = require("../lib/exports");

function generateOtpUsingCrypto(length = 4) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length);
  const otp = randomInt(min, max);
  return otp.toString();
}

const schema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email cannot be empty",
    "string.email":
      "Please provide a valid email address with TLDs: .com, .net, .one",
    "any.required": "Email is required.",
  }),
});

const otpEmailHtml = (name, company, otp, time, firstName, device) => {
  const response = {
    success: false,
    message: null,
    html: null,
  };

  if (!company) {
    response.message = "company can't be empty";
    return response;
  }
  if (!time) {
    response.message = "time can't be empty";
    return response;
  }
  if (!device) {
    response.message = "device can't be empty";
    return response;
  }
  if (!otp) {
    response.message = "OTP can't be empty";
    return response;
  }

  const html = `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333333;
                }
                h1 {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 16px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    margin-bottom: 12px;
                }
                a {
                    color: #007bff;
                    text-decoration: underline;
                }
                .logo {
                    text-align: center;
                    margin-top: 24px;
                }
                .logo img {
                    width: 200px;
                }
                .center-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 150px;
                    margin: auto;
                }
                .digit {
                    font-size: 48px;
                    font-weight: bold;
                    letter-spacing: 10px;
                }
            </style>
        </head>
        <body>
            <h1>Hi ${name || "Sir"},</h1>
            <p>I hope this message finds you well!</p>
            <p>
                In order to verify your account, use the following OTP on the ${company} ${device}.
            </p>
            <div class="center-container">
                <div class="digit">${otp}</div>
            </div>
            <p>
                This OTP is valid for ${time} minutes only. After ${time} minutes, it will not be accessible.
            </p>
            <p>
                Your privacy and security are of utmost importance to us, and we assure you that your email address will be used only for account-related communications and will never be shared with third parties without your consent.
            </p>
            <p>
                Thank you for taking the time to verify your email address. We value your trust in ${company} Company and are committed to providing you with the best services possible.
            </p>
            <p>
                Best regards,<br>
                <b>${firstName || "Sir"}</b>
            </p>
            <p>
                Customer Support Team <br>
                ${company} Company
            </p>
        </body>
    </html>
    `;

  response.success = true;
  response.html = html;
  response.message = "html is now available";
  return response;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: officialMailEmail,
    pass: officialMailPassword,
  },
});

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: officialMailEmail,
    to,
    subject,
    html,
  };

  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        // console.log("info: ", info);
        const message = {
          message: "Email has been sent successfully",
          success: true,
        };
        resolve(message);
      })
      .catch((err) => {
        console.error(
          "Error sending OTP to email using nodemailer service: ",
          err
        );
        const error = {
          message: "Error sending OTP to email using nodemailer service",
          rawError: err,
          success: false,
        };
        reject(error);
      });
  });
};

function calculateExpirationTime(timeInMinutes) {
  const expirationTime = new Date();
  expirationTime.setMinutes(
    expirationTime.getMinutes() + parseInt(timeInMinutes)
  );
  return expirationTime;
}

function validatedExpirationTime(expirationTime) {
  const currentTime = new Date();
  return currentTime > expirationTime;
}

// Final API
const sendOTPToEmail = async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: error.details[0].message,
        success: false,
        otp: null,
        JoiSchemaError: "joi schema validation error",
      });
    }

    const { email } = value;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No user found with this email",
        otp: null,
      });
    }

    const { firstName, lastName } = user;
    const otp = generateOtpUsingCrypto(4);
    const name = firstName + " " + lastName;
    const subject = "Email Verification";
    const company = "Gram Mobile";
    const time = resendEmailTime;
    const device = "app";

    const htmlResponse = otpEmailHtml(
      name,
      company,
      otp,
      time,
      firstName,
      device
    );
    if (!htmlResponse?.success) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: htmlResponse?.success,
        message: htmlResponse?.message,
        otp: null,
      });
    }
    const html = htmlResponse?.html;

    const databaseOTP = {
      code: otp,
      otpExpiresAt: calculateExpirationTime(time),
    };
    const otpStored = await User.findByIdAndUpdate(
      user?._id,
      { otp: databaseOTP },
      { runValidators: true, new: true }
    );

    if (!otpStored) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Error storing OTP in database",
        otp: null,
      });
    }

    const emailResponse = await sendEmail(email, subject, html);
    if (!emailResponse?.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: emailResponse?.success,
        message: emailResponse?.message,
        rawError: emailResponse?.rawError || "",
        otp: null,
      });
    }

    trackFailedAttempt(req.ip, 1, resendEmailTime);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: emailResponse?.message,
    });
  } catch (error) {
    const message = error.message || "We are working to fix this problem";
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Server Error: ${message}`, otp: null, success: false });
  }
};

module.exports = { sendOTPToEmail };
