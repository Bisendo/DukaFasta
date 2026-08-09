// emailService.js

// Load environment variables
require("dotenv").config();

const nodemailer = require("nodemailer");

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Do not print the actual password
console.log("=================================");
console.log("📧 Email Configuration");
console.log("EMAIL_USER:", EMAIL_USER);
console.log("EMAIL_PASS exists:", !!EMAIL_PASS);
console.log("=================================");

// Check credentials before creating transporter
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS is missing!");
  console.error(
    "Make sure your .env file contains EMAIL_USER and EMAIL_PASS."
  );
}

// =====================================================
// CREATE GMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// =====================================================
// TEST GMAIL CONNECTION
// =====================================================

transporter.verify((error) => {
  if (error) {
    console.error("=================================");
    console.error("❌ Gmail SMTP connection failed");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("=================================");
  } else {
    console.log("=================================");
    console.log("✅ Gmail SMTP server is ready");
    console.log("=================================");
  }
});

// =====================================================
// EMAIL SERVICE CLASS
// =====================================================

class EmailService {

  // ===================================================
  // SEND PASSWORD RESET OTP
  // ===================================================

  async sendOTPEmail(email, otp, firstName) {

    try {

      console.log("=================================");
      console.log("📧 Sending password reset OTP");
      console.log("To:", email);
      console.log("OTP:", otp);
      console.log("=================================");

      // Check recipient
      if (!email) {
        throw new Error("Recipient email address is missing");
      }

      // Check OTP
      if (!otp) {
        throw new Error("OTP is missing");
      }

      const mailOptions = {

        // Sender
        from: `"DukaFasta" <${EMAIL_USER}>`,

        // Recipient
        to: email,

        // Email subject
        subject: "Password Reset OTP - DukaFasta",

        // HTML email
        html: `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  <meta name="viewport"
        content="width=device-width, initial-scale=1.0">

  <title>Password Reset OTP</title>

</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    max-width: 600px;
    margin: 30px auto;
    background-color: #ffffff;
    border-radius: 10px;
    padding: 30px;
    box-sizing: border-box;
  ">

    <!-- Header -->

    <div style="
      text-align: center;
      margin-bottom: 30px;
    ">

      <h1 style="
        margin: 0;
        color: #2563eb;
      ">
        DukaFasta
      </h1>

      <p style="
        color: #666666;
        margin-top: 8px;
      ">
        Online Shopping System
      </p>

    </div>

    <!-- Title -->

    <h2 style="
      color: #222222;
    ">
      Password Reset Request
    </h2>

    <!-- Greeting -->

    <p style="
      color: #444444;
      font-size: 16px;
      line-height: 1.6;
    ">

      Hello
      <strong>${firstName || "Customer"}</strong>,

    </p>

    <!-- Message -->

    <p style="
      color: #444444;
      font-size: 16px;
      line-height: 1.6;
    ">

      We received a request to reset your
      DukaFasta account password.

      Use the OTP below to continue:

    </p>

    <!-- OTP Box -->

    <div style="
      background-color: #f3f4f6;
      border-radius: 10px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    ">

      <p style="
        margin: 0 0 10px 0;
        color: #666666;
        font-size: 14px;
      ">
        Your verification code
      </p>

      <div style="
        font-size: 36px;
        font-weight: bold;
        color: #2563eb;
        letter-spacing: 8px;
      ">

        ${otp}

      </div>

      <p style="
        margin: 15px 0 0 0;
        color: #666666;
        font-size: 13px;
      ">

        This code will expire in 10 minutes.

      </p>

    </div>

    <!-- Security Notice -->

    <div style="
      background-color: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 15px;
      margin: 20px 0;
    ">

      <strong>
        Security Notice
      </strong>

      <p style="
        margin: 8px 0 0 0;
        color: #555555;
        font-size: 14px;
      ">

        If you did not request a password reset,
        please ignore this email.

      </p>

    </div>

    <!-- Footer -->

    <hr style="
      border: none;
      border-top: 1px solid #eeeeee;
      margin: 30px 0;
    ">

    <p style="
      text-align: center;
      color: #888888;
      font-size: 12px;
      line-height: 1.5;
    ">

      This is an automated message.
      Please do not reply to this email.

      <br><br>

      © ${new Date().getFullYear()} DukaFasta.
      All rights reserved.

    </p>

  </div>

</body>

</html>
        `,
      };

      // ===============================================
      // SEND EMAIL
      // ===============================================

      const info = await transporter.sendMail(mailOptions);

      console.log("=================================");
      console.log("✅ OTP EMAIL SENT SUCCESSFULLY");
      console.log("To:", email);
      console.log("Message ID:", info.messageId);
      console.log("Accepted:", info.accepted);
      console.log("Rejected:", info.rejected);
      console.log("=================================");

      return {

        success: true,

        email: email,

        messageId: info.messageId,

        accepted: info.accepted,

        rejected: info.rejected,

      };

    } catch (error) {

      console.error("=================================");
      console.error("❌ OTP EMAIL FAILED");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("Command:", error.command);
      console.error("Response:", error.response);
      console.error("Response Code:", error.responseCode);
      console.error("=================================");

      return {

        success: false,

        email: email,

        error: error.message,

        code: error.code,

      };

    }

  }


  // ===================================================
  // SEND WELCOME EMAIL
  // ===================================================

  async sendWelcomeEmail(user) {

    try {

      if (!user || !user.email) {

        throw new Error(
          "User email is missing"
        );

      }

      const firstName =
        user.firstName ||
        user.name ||
        "Customer";

      const mailOptions = {

        from:
          `"DukaFasta" <${EMAIL_USER}>`,

        to: user.email,

        subject:
          "Welcome to DukaFasta 🎉",

        html: `

          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          ">

            <h1 style="
              color: #2563eb;
              text-align: center;
            ">
              Welcome to DukaFasta!
            </h1>

            <p>
              Hello
              <strong>${firstName}</strong>,
            </p>

            <p>
              Your DukaFasta account has been
              created successfully.
            </p>

            <p>
              You can now log in and start
              shopping.
            </p>

            <hr>

            <p style="
              text-align: center;
              color: #777;
              font-size: 12px;
            ">
              © ${new Date().getFullYear()}
              DukaFasta
            </p>

          </div>

        `,

      };

      const info =
        await transporter.sendMail(
          mailOptions
        );

      console.log(
        "✅ Welcome email sent:",
        info.messageId
      );

      return {

        success: true,

        email: user.email,

        messageId: info.messageId,

      };

    } catch (error) {

      console.error(
        "❌ Welcome email failed:",
        error.message
      );

      return {

        success: false,

        error: error.message,

      };

    }

  }


  // ===================================================
  // SEND SHOPKEEPER CREDENTIALS
  // ===================================================

  async sendShopkeeperCredentials(
    shopkeeper,
    password,
    ownerName
  ) {

    try {

      if (!shopkeeper || !shopkeeper.email) {

        throw new Error(
          "Shopkeeper email is missing"
        );

      }

      const name =
        ownerName ||
        shopkeeper.firstName ||
        shopkeeper.name ||
        "Shopkeeper";

      const mailOptions = {

        from:
          `"DukaFasta" <${EMAIL_USER}>`,

        to: shopkeeper.email,

        subject:
          "DukaFasta Shopkeeper Account",

        html: `

          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          ">

            <h2 style="
              color: #2563eb;
            ">
              DukaFasta Shopkeeper Account
            </h2>

            <p>
              Hello
              <strong>${name}</strong>,
            </p>

            <p>
              Your shopkeeper account has
              been created successfully.
            </p>

            <div style="
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
            ">

              <p>
                <strong>Email:</strong>
                ${shopkeeper.email}
              </p>

              <p>
                <strong>Password:</strong>
                ${password}
              </p>

            </div>

            <p>
              Please change your password after
              logging in.
            </p>

            <hr>

            <p style="
              text-align: center;
              color: #777;
              font-size: 12px;
            ">
              © ${new Date().getFullYear()}
              DukaFasta
            </p>

          </div>

        `,

      };

      const info =
        await transporter.sendMail(
          mailOptions
        );

      console.log(
        "✅ Shopkeeper credentials sent:",
        info.messageId
      );

      return {

        success: true,

        email: shopkeeper.email,

        messageId: info.messageId,

      };

    } catch (error) {

      console.error(
        "❌ Shopkeeper email failed:",
        error.message
      );

      return {

        success: false,

        error: error.message,

      };

    }

  }


  // ===================================================
  // PASSWORD RESET CONFIRMATION
  // ===================================================

  async sendPasswordResetConfirmation(
    email,
    firstName
  ) {

    try {

      if (!email) {

        throw new Error(
          "Email address is missing"
        );

      }

      const mailOptions = {

        from:
          `"DukaFasta" <${EMAIL_USER}>`,

        to: email,

        subject:
          "Password Changed Successfully - DukaFasta",

        html: `

          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          ">

            <h2 style="
              color: #2563eb;
            ">
              Password Changed Successfully
            </h2>

            <p>
              Hello
              <strong>${firstName || "Customer"}</strong>,
            </p>

            <p>
              Your DukaFasta password has been
              changed successfully.
            </p>

            <p>
              If you did not make this change,
              please contact support immediately.
            </p>

            <hr>

            <p style="
              text-align: center;
              color: #777;
              font-size: 12px;
            ">
              © ${new Date().getFullYear()}
              DukaFasta
            </p>

          </div>

        `,

      };

      const info =
        await transporter.sendMail(
          mailOptions
        );

      console.log(
        "✅ Password confirmation email sent:",
        info.messageId
      );

      return {

        success: true,

        email: email,

        messageId: info.messageId,

      };

    } catch (error) {

      console.error(
        "❌ Password confirmation email failed:",
        error.message
      );

      return {

        success: false,

        error: error.message,

      };

    }

  }

}

// =====================================================
// EXPORT EMAIL SERVICE
// =====================================================

module.exports = new EmailService();
