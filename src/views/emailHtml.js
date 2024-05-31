const otpEmailHtml = (name, company, otp, time, firstName, device) => {
  const response = {
    success: false,
    message: null,
    html: null,
  }
  
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
  response.message = "html is now available"
  return response;
};

module.exports = { otpEmailHtml };
