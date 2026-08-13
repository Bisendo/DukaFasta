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
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

console.log("=================================");
console.log("📧 DUKAFASTA EMAIL SERVICE");
console.log("=================================");
console.log(
    "EMAIL_USER:",
    EMAIL_USER || "NOT SET"
);
console.log(
    "EMAIL_PASS exists:",
    Boolean(EMAIL_PASS)
);
console.log(
    "FRONTEND_URL:",
    FRONTEND_URL
);
console.log("=================================");

if (!EMAIL_USER) {
    console.error(
        "❌ EMAIL_USER is missing from .env"
    );
}

if (!EMAIL_PASS) {
    console.error(
        "❌ EMAIL_PASS is missing from .env"
    );
}

// =====================================================
// SMTP TRANSPORTER
// =====================================================
//
// Port 465 = TLS immediately
// family: 4 = force IPv4
//
// Short timeouts prevent a failed SMTP connection
// from making the application wait for a long time.
//
// Pooling keeps SMTP connections available for reuse.
// =====================================================

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 465,

    secure: true,

    // IMPORTANT
    family: 4,

    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },

    // Short timeouts
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    dnsTimeout: 5000,

    // SMTP connection pooling
    pool: true,
    maxConnections: 2,
    maxMessages: 50,

    tls: {
        servername: "smtp.gmail.com",
        minVersion: "TLSv1.2"
    }
});

// =====================================================
// GENERIC SEND MAIL
// =====================================================

async function sendMail({
    to,
    subject,
    text,
    html
}) {

    try {

        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error(
                "EMAIL_USER or EMAIL_PASS is missing."
            );
        }

        if (!to) {
            throw new Error(
                "Recipient email is required."
            );
        }

        const mailOptions = {
            from: `"DukaFasta" <${EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        console.log("=================================");
        console.log("📧 SENDING EMAIL");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("=================================");

        const info =
            await transporter.sendMail(
                mailOptions
            );

        console.log("=================================");
        console.log("✅ EMAIL SENT");
        console.log("To:", to);
        console.log(
            "Message ID:",
            info.messageId
        );
        console.log(
            "Accepted:",
            info.accepted
        );
        console.log("=================================");

        return {
            success: true,
            email: to,
            messageId:
                info.messageId || null,
            accepted:
                info.accepted || [],
            rejected:
                info.rejected || []
        };

    } catch (error) {

        console.error("=================================");
        console.error("❌ EMAIL FAILED");
        console.error("To:", to);
        console.error(
            "Message:",
            error.message
        );
        console.error(
            "Code:",
            error.code || null
        );
        console.error(
            "Command:",
            error.command || null
        );
        console.error("=================================");

        let friendlyError =
            error.message ||
            "Email sending failed.";

        if (
            error.code === "ETIMEDOUT"
        ) {
            friendlyError =
                "Gmail SMTP connection timed out.";
        }

        if (
            error.code === "ENETUNREACH"
        ) {
            friendlyError =
                "Network cannot reach Gmail SMTP over IPv4.";
        }

        if (
            error.code === "ECONNECTION"
        ) {
            friendlyError =
                "Could not connect to Gmail SMTP.";
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
            email: to || null,
            messageId: null,
            error: friendlyError,
            details: error.message,
            code: error.code || null
        };
    }
}

// =====================================================
// EMAIL SERVICE CLASS
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

            if (
                !shopkeeper ||
                !shopkeeper.email
            ) {
                throw new Error(
                    "Shopkeeper email is missing."
                );
            }

            if (!password) {
                throw new Error(
                    "Shopkeeper password is missing."
                );
            }

            const shopkeeperName =
                shopkeeper.firstName ||
                "Shopkeeper";

            const creatorName =
                ownerName ||
                "DukaFasta Administrator";

            const loginUrl =
                `${FRONTEND_URL}/login`;

            const subject =
                "DukaFasta Shopkeeper Account";

            // =================================================
            // TEXT EMAIL
            // =================================================

            const text = `
Hello ${shopkeeperName},

Your DukaFasta shopkeeper account has been created.

Created by: ${creatorName}

LOGIN DETAILS
=============

Email: ${shopkeeper.email}
Password: ${password}

Login:
${loginUrl}

Please change your password after your first login.

DukaFasta Team
`;

            // =================================================
            // HTML EMAIL
            // =================================================

            const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>DukaFasta Shopkeeper Account</title>

</head>

<body style="
    margin:0;
    padding:0;
    background:#f3f4f6;
    font-family:Arial,Helvetica,sans-serif;
">

<div style="
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border-radius:12px;
    padding:30px;
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
Hello <strong>${shopkeeperName}</strong>,
</p>

<p>
Your DukaFasta shopkeeper account has been
created successfully.
</p>

<p>
Created by:
<strong>${creatorName}</strong>
</p>

<div style="
    background:#f3f4f6;
    padding:20px;
    border-radius:10px;
    margin:25px 0;
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

<p style="
    color:#dc2626;
">

<strong>Security:</strong>

Please change your password after your
first login.

</p>

<div style="
    text-align:center;
    margin:30px 0;
">

<a
    href="${loginUrl}"
    style="
        display:inline-block;
        padding:13px 25px;
        background:#2563eb;
        color:#ffffff;
        text-decoration:none;
        border-radius:7px;
        font-weight:bold;
    "
>
Login to DukaFasta
</a>

</div>

<p>
Login address:
</p>

<p>
<a href="${loginUrl}">
${loginUrl}
</a>
</p>

<hr>

<p style="
    text-align:center;
    color:#777;
    font-size:12px;
">

© ${new Date().getFullYear()}
DukaFasta

</p>

</div>

</body>

</html>
`;

            // =================================================
            // SEND ONCE
            // =================================================
            //
            // IMPORTANT:
            // No 3 retries here.
            //
            // The route will call this in the background.
            // =================================================

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
                    shopkeeper?.email ||
                    null,
                messageId: null,
                error:
                    error.message
            };
        }
    }

    // =================================================
    // OWNER WELCOME EMAIL
    // =================================================

    async sendWelcomeEmail(user) {

        try {

            if (
                !user ||
                !user.email
            ) {
                throw new Error(
                    "User email is missing."
                );
            }

            const firstName =
                user.firstName ||
                "Customer";

            const subject =
                "Welcome to DukaFasta 🎉";

            const text = `
Hello ${firstName},

Your DukaFasta account has been created successfully.

You can now log in and start using DukaFasta.

DukaFasta Team
`;

            const html = `
<!DOCTYPE html>

<html>

<body style="
    font-family:Arial,sans-serif;
    background:#f3f4f6;
    padding:30px;
">

<div style="
    max-width:600px;
    margin:auto;
    background:#ffffff;
    padding:30px;
    border-radius:10px;
">

<h1 style="
    color:#2563eb;
    text-align:center;
">
Welcome to DukaFasta!
</h1>

<p>
Hello <strong>${firstName}</strong>,
</p>

<p>
Your DukaFasta account has been created successfully.
</p>

<p>
You can now log in and start using DukaFasta.
</p>

<hr>

<p style="
    text-align:center;
    color:#777;
    font-size:12px;
">

© ${new Date().getFullYear()}
DukaFasta

</p>

</div>

</body>

</html>
`;

            return await sendMail({
                to: user.email,
                subject,
                text,
                html
            });

        } catch (error) {

            console.error(
                "❌ Welcome email error:",
                error.message
            );

            return {
                success: false,
                email:
                    user?.email || null,
                error:
                    error.message
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

            if (!email) {
                throw new Error(
                    "Email address is missing."
                );
            }

            if (!otp) {
                throw new Error(
                    "OTP is missing."
                );
            }

            const name =
                firstName ||
                "Customer";

            const subject =
                "Password Reset OTP - DukaFasta";

            const text = `
Hello ${name},

Your DukaFasta password reset code is:

${otp}

This code will expire in 10 minutes.

If you did not request this code,
please ignore this email.

DukaFasta Team
`;

            const html = `
<!DOCTYPE html>

<html>

<body style="
    font-family:Arial,sans-serif;
    background:#f3f4f6;
    padding:30px;
">

<div style="
    max-width:600px;
    margin:auto;
    background:#ffffff;
    padding:30px;
    border-radius:10px;
">

<h1 style="
    color:#2563eb;
    text-align:center;
">
DukaFasta
</h1>

<h2>
Password Reset
</h2>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
Your password reset verification code is:
</p>

<div style="
    background:#f3f4f6;
    padding:25px;
    text-align:center;
    border-radius:10px;
">

<div style="
    font-size:36px;
    font-weight:bold;
    color:#2563eb;
    letter-spacing:8px;
">

${otp}

</div>

<p>
This code expires in 10 minutes.
</p>

</div>

<p>
If you did not request this code,
please ignore this email.
</p>

</div>

</body>

</html>
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
                email: email || null,
                error:
                    error.message
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

            if (!email) {
                throw new Error(
                    "Email address is missing."
                );
            }

            const name =
                firstName ||
                "Customer";

            const subject =
                "Password Changed Successfully - DukaFasta";

            const text = `
Hello ${name},

Your DukaFasta password has been changed successfully.

If you did not make this change,
please contact support immediately.

DukaFasta Team
`;

            const html = `
<!DOCTYPE html>

<html>

<body style="
    font-family:Arial,sans-serif;
    background:#f3f4f6;
    padding:30px;
">

<div style="
    max-width:600px;
    margin:auto;
    background:#ffffff;
    padding:30px;
    border-radius:10px;
">

<h2 style="
    color:#2563eb;
">
Password Changed Successfully
</h2>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
Your DukaFasta password has been changed successfully.
</p>

<p style="
    color:#dc2626;
">

If you did not make this change,
please contact support immediately.

</p>

<hr>

<p style="
    text-align:center;
    color:#777;
    font-size:12px;
">

© ${new Date().getFullYear()}
DukaFasta

</p>

</div>

</body>

</html>
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
                email: email || null,
                error:
                    error.message
            };
        }
    }

    // =================================================
    // TEST EMAIL
    // =================================================

    async testEmailConfiguration(
        testEmail
    ) {

        if (!testEmail) {
            return {
                success: false,
                error:
                    "Test email is required."
            };
        }

        return await sendMail({

            to: testEmail,

            subject:
                "DukaFasta Email Test",

            text: `
This is a test email from DukaFasta.

If you received this message,
Gmail SMTP is working.
`,

            html: `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
">

<h2 style="
    color:#2563eb;
">
DukaFasta Email Test
</h2>

<p>
This is a test email from DukaFasta.
</p>

<p>
<strong>
Gmail SMTP is working.
</strong>
</p>

</div>
`
        });
    }

    // =================================================
    // VERIFY SMTP
    // =================================================

    async verify() {

        try {

            console.log(
                "🔄 Checking Gmail SMTP..."
            );

            await transporter.verify();

            console.log(
                "✅ Gmail SMTP is ready."
            );

            return true;

        } catch (error) {

            console.error(
                "❌ Gmail SMTP verification failed:"
            );

            console.error(
                error.message
            );

            console.error(
                "Code:",
                error.code || null
            );

            return false;
        }
    }
}

// =====================================================
// CREATE SINGLE EMAIL SERVICE INSTANCE
// =====================================================

const emailService =
    new EmailService();

// =====================================================
// VERIFY IN BACKGROUND
// =====================================================

setTimeout(() => {

    emailService
        .verify()
        .catch(error => {

            console.error(
                "SMTP verification error:",
                error.message
            );

        });

}, 1000);

// =====================================================
// EXPORT
// =====================================================

module.exports =
    emailService;