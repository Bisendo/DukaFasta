// =====================================================
// DukaFasta - Email Service
// =====================================================

require("dotenv").config();

const nodemailer = require("nodemailer");
const dns = require("dns");

// =====================================================
// FORCE IPV4
// =====================================================

try {
    dns.setDefaultResultOrder("ipv4first");
    console.log("🌐 DNS: IPv4 first");
} catch (error) {
    console.warn(
        "⚠️ Could not set DNS result order:",
        error.message
    );
}

// =====================================================
// ENVIRONMENT
// =====================================================

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const FRONTEND_URL =
    process.env.FRONTEND_URL || "http://localhost:3000";

console.log("=================================");
console.log("📧 EMAIL CONFIGURATION");
console.log("=================================");
console.log("EMAIL_USER:", EMAIL_USER || "NOT SET");
console.log("EMAIL_PASS exists:", Boolean(EMAIL_PASS));
console.log("FRONTEND_URL:", FRONTEND_URL);
console.log("=================================");

// =====================================================
// SMTP TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    // Gmail SMTP SSL
    port: 465,

    // SSL/TLS
    secure: true,

    // VERY IMPORTANT
    // Force IPv4
    family: 4,

    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },

    // Keep connection alive
    pool: true,

    maxConnections: 2,
    maxMessages: 100,

    // Short timeouts
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    tls: {
        servername: "smtp.gmail.com",
        minVersion: "TLSv1.2"
    }
});

// =====================================================
// SEND MAIL
// =====================================================

async function sendMail({
    to,
    subject,
    text,
    html
}) {

    if (!EMAIL_USER || !EMAIL_PASS) {

        return {
            success: false,
            error:
                "EMAIL_USER or EMAIL_PASS is missing from .env"
        };
    }

    if (!to) {

        return {
            success: false,
            error: "Recipient email is required"
        };
    }

    try {

        console.log("=================================");
        console.log("📧 SENDING EMAIL");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("=================================");

        const info = await transporter.sendMail({

            from: `"DukaFasta" <${EMAIL_USER}>`,

            to,

            subject,

            text,

            html
        });

        console.log("=================================");
        console.log("✅ EMAIL SENT");
        console.log("To:", to);
        console.log("Message ID:", info.messageId);
        console.log("=================================");

        return {

            success: true,

            email: to,

            messageId: info.messageId || null,

            accepted: info.accepted || [],

            rejected: info.rejected || []
        };

    } catch (error) {

        console.error("=================================");
        console.error("❌ EMAIL FAILED");
        console.error("Message:", error.message);
        console.error("Code:", error.code || null);
        console.error("=================================");

        let friendlyError = error.message;

        if (error.code === "ENETUNREACH") {

            friendlyError =
                "Gmail SMTP network connection failed. IPv4 connection is required.";
        }

        if (error.code === "ETIMEDOUT") {

            friendlyError =
                "Gmail SMTP connection timed out.";
        }

        if (
            error.code === "EAUTH" ||
            error.responseCode === 535
        ) {

            friendlyError =
                "Gmail authentication failed. Check EMAIL_USER and EMAIL_PASS.";
        }

        return {

            success: false,

            email: to,

            messageId: null,

            error: friendlyError,

            details: error.message,

            code: error.code || null
        };
    }
}

// =====================================================
// EMAIL SERVICE
// =====================================================

class EmailService {

    // =================================================
    // SHOPKEEPER CREDENTIALS
    // =================================================

    async sendShopkeeperCredentials(
        shopkeeper,
        password,
        ownerName
    ) {

        try {

            if (!shopkeeper?.email) {

                throw new Error(
                    "Shopkeeper email is missing"
                );
            }

            if (!password) {

                throw new Error(
                    "Shopkeeper password is missing"
                );
            }

            const name =
                shopkeeper.firstName ||
                "Shopkeeper";

            const creator =
                ownerName ||
                "DukaFasta Administrator";

            const loginUrl =
                `${FRONTEND_URL}/login`;

            const subject =
                "DukaFasta Shopkeeper Account";

            const text = `
Hello ${name},

Your DukaFasta shopkeeper account has been created.

Created by: ${creator}

LOGIN DETAILS

Email: ${shopkeeper.email}
Password: ${password}

Login:
${loginUrl}

Please change your password after your first login.

DukaFasta Team
`;

            const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>DukaFasta Shopkeeper Account</title>

</head>

<body style="
margin:0;
padding:30px;
background:#f5f5f5;
font-family:Arial,sans-serif;
">

<div style="
max-width:600px;
margin:auto;
background:white;
padding:30px;
border-radius:12px;
">

<h1 style="
text-align:center;
color:#2563eb;
">

DukaFasta

</h1>

<h2>
Shopkeeper Account Created
</h2>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
You have been added as a shopkeeper by
<strong>${creator}</strong>.
</p>

<div style="
background:#f3f4f6;
padding:20px;
border-radius:8px;
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

<p style="color:#dc2626;">

<strong>Important:</strong>
Please change your password after your first login.

</p>

<div style="
text-align:center;
margin:30px 0;
">

<a href="${loginUrl}"
style="
display:inline-block;
background:#2563eb;
color:white;
text-decoration:none;
padding:14px 25px;
border-radius:7px;
">

Login to DukaFasta

</a>

</div>

<p>

Login address:

<br>

<a href="${loginUrl}">
${loginUrl}
</a>

</p>

<hr>

<p style="
text-align:center;
font-size:12px;
color:#777;
">

© ${new Date().getFullYear()} DukaFasta

</p>

</div>

</body>

</html>
`;

            // IMPORTANT:
            // Only ONE attempt.
            // No 3 retries and no delays.

            return await sendMail({

                to: shopkeeper.email,

                subject,

                text,

                html
            });

        } catch (error) {

            console.error(
                "❌ Shopkeeper email error:",
                error.message
            );

            return {

                success: false,

                email:
                    shopkeeper?.email || null,

                error: error.message
            };
        }
    }

    // =================================================
    // WELCOME EMAIL
    // =================================================

    async sendWelcomeEmail(user) {

        try {

            if (!user?.email) {

                throw new Error(
                    "User email is missing"
                );
            }

            const name =
                user.firstName || "Customer";

            const subject =
                "Welcome to DukaFasta 🎉";

            const text = `
Hello ${name},

Your DukaFasta account has been created successfully.

You can now log in and start shopping.

DukaFasta Team
`;

            const html = `
<div style="
font-family:Arial,sans-serif;
max-width:600px;
margin:auto;
padding:30px;
">

<h1 style="color:#2563eb;">
Welcome to DukaFasta!
</h1>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
Your DukaFasta account has been created successfully.
</p>

<p>
You can now log in and start shopping.
</p>

<hr>

<p style="
text-align:center;
color:#777;
font-size:12px;
">

© ${new Date().getFullYear()} DukaFasta

</p>

</div>
`;

            return await sendMail({

                to: user.email,

                subject,

                text,

                html
            });

        } catch (error) {

            return {

                success: false,

                email:
                    user?.email || null,

                error: error.message
            };
        }
    }

    // =================================================
    // OTP EMAIL
    // =================================================

    async sendOTPEmail(
        email,
        otp,
        firstName
    ) {

        try {

            const name =
                firstName || "Customer";

            const subject =
                "Password Reset OTP - DukaFasta";

            const text = `
Hello ${name},

Your DukaFasta verification code is:

${otp}

This code expires in 10 minutes.

DukaFasta Team
`;

            const html = `
<div style="
font-family:Arial,sans-serif;
max-width:600px;
margin:auto;
padding:30px;
">

<h1 style="color:#2563eb;">
DukaFasta
</h1>

<h2>
Password Reset
</h2>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
Your verification code is:
</p>

<div style="
font-size:36px;
font-weight:bold;
letter-spacing:8px;
color:#2563eb;
text-align:center;
padding:20px;
">

${otp}

</div>

<p>
This code expires in 10 minutes.
</p>

</div>
`;

            return await sendMail({

                to: email,

                subject,

                text,

                html
            });

        } catch (error) {

            return {

                success: false,

                email,

                error: error.message
            };
        }
    }

    // =================================================
    // PASSWORD RESET CONFIRMATION
    // =================================================

    async sendPasswordResetConfirmation(
        email,
        firstName
    ) {

        try {

            const name =
                firstName || "Customer";

            const subject =
                "Password Changed Successfully - DukaFasta";

            const text = `
Hello ${name},

Your DukaFasta password has been changed successfully.

If you did not make this change, contact support immediately.

DukaFasta Team
`;

            const html = `
<div style="
font-family:Arial,sans-serif;
max-width:600px;
margin:auto;
padding:30px;
">

<h2 style="color:#2563eb;">
Password Changed Successfully
</h2>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
Your DukaFasta password has been changed successfully.
</p>

<p style="color:#dc2626;">

If you did not make this change,
contact support immediately.

</p>

</div>
`;

            return await sendMail({

                to: email,

                subject,

                text,

                html
            });

        } catch (error) {

            return {

                success: false,

                email,

                error: error.message
            };
        }
    }

    // =================================================
    // TEST EMAIL
    // =================================================

    async testEmailConfiguration(
        testEmail
    ) {

        return await sendMail({

            to: testEmail,

            subject: "DukaFasta Email Test",

            text: `
DukaFasta Gmail SMTP test.

If you received this email,
your SMTP configuration is working.
`,

            html: `
<div style="
font-family:Arial,sans-serif;
padding:30px;
">

<h2 style="color:#2563eb;">
DukaFasta Email Test
</h2>

<p>
Gmail SMTP is working correctly.
</p>

</div>
`
        });
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = new EmailService();