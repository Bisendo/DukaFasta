// =====================================================
// DukaFasta - Email Service
// Gmail SMTP + IPv4 + STARTTLS
// =====================================================

"use strict";

const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const dns = require("dns");

// =====================================================
// LOAD ENVIRONMENT
// =====================================================
//
// index.js already loads .env first.
// This is an additional safe fallback for this service.
// It does NOT override existing environment variables.
//
// =====================================================

dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

// =====================================================
// FORCE IPV4
// =====================================================

try {
    dns.setDefaultResultOrder("ipv4first");

    console.log("🌐 DNS configured: IPv4 first");
} catch (error) {
    console.warn(
        "⚠️ Could not configure IPv4 first:",
        error.message
    );
}

// =====================================================
// EMAIL CONFIGURATION
// =====================================================
//
// IMPORTANT:
// Do NOT store EMAIL_USER / EMAIL_PASS in constants.
// Read them when they are actually needed.
//
// =====================================================

function getEmailConfig() {
    return {
        user: String(
            process.env.EMAIL_USER || ""
        ).trim(),

        pass: String(
            process.env.EMAIL_PASS || ""
        ).trim(),

        host: String(
            process.env.EMAIL_HOST ||
            "smtp.gmail.com"
        ).trim(),

        port: Number(
            process.env.EMAIL_PORT || 587
        ),

        secure:
            String(
                process.env.EMAIL_SECURE || "false"
            ).toLowerCase() === "true",

        frontendUrl: String(
            process.env.FRONTEND_URL ||
            "http://localhost:3000"
        ).trim()
    };
}

// =====================================================
// CONFIGURATION LOG
// =====================================================

function logEmailConfiguration() {
    const config = getEmailConfig();

    console.log("");
    console.log("========================================");
    console.log("📧 DUKAFASTA EMAIL CONFIGURATION");
    console.log("========================================");

    console.log(
        "EMAIL_USER:",
        config.user || "NOT SET"
    );

    console.log(
        "EMAIL_PASS:",
        config.pass ? "LOADED" : "MISSING"
    );

    console.log(
        "EMAIL_PASS LENGTH:",
        config.pass.length
    );

    console.log(
        "EMAIL_HOST:",
        config.host
    );

    console.log(
        "EMAIL_PORT:",
        config.port
    );

    console.log(
        "EMAIL_SECURE:",
        config.secure
    );

    console.log(
        "FRONTEND_URL:",
        config.frontendUrl
    );

    console.log(
        "IP FAMILY:",
        "IPv4"
    );

    console.log("========================================");
    console.log("");
}

// =====================================================
// CREATE TRANSPORTER
// =====================================================

function createTransporter() {
    const config = getEmailConfig();

    if (!config.user || !config.pass) {
        console.warn(
            "⚠️ SMTP transporter created without complete credentials"
        );
    }

    return nodemailer.createTransport({
        host: config.host,

        port: config.port,

        secure: config.secure,

        requireTLS: !config.secure,

        family: 4,

        auth: {
            user: config.user,
            pass: config.pass
        },

        connectionTimeout: 10000,

        greetingTimeout: 10000,

        socketTimeout: 15000,

        dnsTimeout: 5000,

        tls: {
            servername: config.host,

            minVersion: "TLSv1.2"
        }
    });
}

// =====================================================
// SMTP VERIFICATION
// =====================================================

async function verifySMTP() {
    const config = getEmailConfig();

    console.log("");
    console.log("========================================");
    console.log("📧 GMAIL SMTP VERIFICATION");
    console.log("========================================");

    console.log(
        "EMAIL_USER:",
        config.user || "MISSING"
    );

    console.log(
        "EMAIL_PASS:",
        config.pass ? "LOADED" : "MISSING"
    );

    console.log(
        "EMAIL_PASS LENGTH:",
        config.pass.length
    );

    console.log(
        "SMTP:",
        `${config.host}:${config.port}`
    );

    console.log("========================================");

    // -------------------------------------------------
    // CHECK USER
    // -------------------------------------------------

    if (!config.user) {
        return {
            success: false,
            error: "EMAIL_USER is missing from .env"
        };
    }

    // -------------------------------------------------
    // CHECK PASSWORD
    // -------------------------------------------------

    if (!config.pass) {
        return {
            success: false,
            error: "EMAIL_PASS is missing from .env"
        };
    }

    // -------------------------------------------------
    // CREATE FRESH TRANSPORTER
    // -------------------------------------------------

    const mailTransporter = createTransporter();

    try {
        console.log(
            "🔄 Verifying Gmail SMTP connection..."
        );

        await mailTransporter.verify();

        console.log(
            "✅ Gmail SMTP connection successful"
        );

        return {
            success: true,
            message:
                "Gmail SMTP connection successful"
        };

    } catch (error) {
        console.error("");
        console.error(
            "❌ Gmail SMTP verification failed"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code || null
        );

        console.error(
            "Response:",
            error.response || null
        );

        console.error(
            "Response Code:",
            error.responseCode || null
        );

        console.error("");

        return {
            success: false,

            error:
                getFriendlyError(error),

            details:
                error.message,

            code:
                error.code || null,

            responseCode:
                error.responseCode || null
        };

    } finally {
        try {
            mailTransporter.close();
        } catch (_) {
            // Ignore transporter close errors
        }
    }
}

// =====================================================
// FRIENDLY ERROR
// =====================================================

function getFriendlyError(error) {
    if (!error) {
        return "Unknown email error";
    }

    if (error.code === "ETIMEDOUT") {
        return (
            "Connection to Gmail SMTP timed out. " +
            "Check the server network connection."
        );
    }

    if (error.code === "ENETUNREACH") {
        return (
            "The server cannot reach Gmail SMTP. " +
            "This is a network or IPv4 routing problem."
        );
    }

    if (error.code === "ECONNECTION") {
        return (
            "Could not connect to Gmail SMTP server."
        );
    }

    if (
        error.code === "EAUTH" ||
        error.responseCode === 535
    ) {
        return (
            "Gmail authentication failed. " +
            "Check EMAIL_USER and EMAIL_PASS. " +
            "EMAIL_PASS must be a valid Google App Password."
        );
    }

    if (
        error.responseCode === 550 ||
        error.responseCode === 553
    ) {
        return (
            "Gmail rejected the sender or recipient email address."
        );
    }

    return (
        error.message ||
        "Email sending failed"
    );
}

// =====================================================
// SEND MAIL
// =====================================================

async function sendMail({
    to,
    subject,
    text,
    html
}) {
    const config = getEmailConfig();

    // =================================================
    // CONFIGURATION VALIDATION
    // =================================================

    console.log("");
    console.log("========================================");
    console.log("📧 EMAIL CONFIGURATION CHECK");
    console.log("========================================");

    console.log(
        "EMAIL_USER:",
        config.user || "MISSING"
    );

    console.log(
        "EMAIL_PASS:",
        config.pass ? "LOADED" : "MISSING"
    );

    console.log(
        "EMAIL_PASS LENGTH:",
        config.pass.length
    );

    console.log("========================================");

    if (!config.user) {
        return {
            success: false,
            email: to || null,
            messageId: null,
            error:
                "EMAIL_USER is missing from .env"
        };
    }

    if (!config.pass) {
        return {
            success: false,
            email: to || null,
            messageId: null,
            error:
                "EMAIL_PASS is missing from .env"
        };
    }

    if (!to) {
        return {
            success: false,
            email: null,
            messageId: null,
            error:
                "Recipient email is required"
        };
    }

    if (!subject) {
        return {
            success: false,
            email: to,
            messageId: null,
            error:
                "Email subject is required"
        };
    }

    // =================================================
    // CREATE FRESH TRANSPORTER
    // =================================================

    const mailTransporter = createTransporter();

    try {
        console.log("");
        console.log("========================================");
        console.log("📧 SENDING EMAIL");
        console.log("========================================");

        console.log(
            "From:",
            config.user
        );

        console.log(
            "To:",
            to
        );

        console.log(
            "Subject:",
            subject
        );

        console.log(
            "SMTP:",
            `${config.host}:${config.port}`
        );

        console.log(
            "IPv4:",
            "enabled"
        );

        console.log("========================================");

        const info =
            await mailTransporter.sendMail({
                from:
                    `"DukaFasta" <${config.user}>`,

                to,

                subject,

                text,

                html
            });

        // =================================================
        // ACCEPTED / REJECTED
        // =================================================

        const accepted =
            Array.isArray(info.accepted)
                ? info.accepted
                : [];

        const rejected =
            Array.isArray(info.rejected)
                ? info.rejected
                : [];

        // =================================================
        // FULL REJECTION
        // =================================================

        if (
            rejected.length > 0 &&
            accepted.length === 0
        ) {
            console.error(
                "❌ Gmail rejected the email"
            );

            return {
                success: false,

                email: to,

                messageId:
                    info.messageId || null,

                error:
                    "Gmail rejected the recipient.",

                accepted,

                rejected
            };
        }

        // =================================================
        // SUCCESS
        // =================================================

        console.log("");
        console.log("========================================");
        console.log("✅ EMAIL SENT SUCCESSFULLY");
        console.log("========================================");

        console.log(
            "To:",
            to
        );

        console.log(
            "Message ID:",
            info.messageId
        );

        console.log(
            "Accepted:",
            accepted
        );

        console.log(
            "Rejected:",
            rejected
        );

        console.log("========================================");

        return {
            success: true,

            email: to,

            messageId:
                info.messageId || null,

            accepted,

            rejected,

            response:
                info.response || null
        };

    } catch (error) {
        console.error("");
        console.error("========================================");
        console.error("❌ EMAIL SEND FAILED");
        console.error("========================================");

        console.error(
            "To:",
            to
        );

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

        console.error(
            "Response:",
            error.response || null
        );

        console.error(
            "Response Code:",
            error.responseCode || null
        );

        console.error("========================================");

        return {
            success: false,

            email: to,

            messageId: null,

            error:
                getFriendlyError(error),

            details:
                error.message,

            code:
                error.code || null,

            command:
                error.command || null,

            responseCode:
                error.responseCode || null
        };

    } finally {
        try {
            mailTransporter.close();
        } catch (_) {
            // Ignore close errors
        }
    }
}

// =====================================================
// EMAIL SERVICE CLASS
// =====================================================

class EmailService {

    // =================================================
    // TRANSPORTER
    // =================================================
    //
    // This keeps compatibility with:
    //
    // EmailService.transporter.verify()
    //
    // used by index.js and emailController.js.
    //
    // =================================================

    get transporter() {
        return createTransporter();
    }

    // =================================================
    // GET CONFIGURATION
    // =================================================

    getConfiguration() {
        const config = getEmailConfig();

        return {
            emailUser:
                config.user
                    ? "Configured"
                    : "Not configured",

            emailPass:
                config.pass
                    ? "Configured"
                    : "Not configured",

            emailPassLength:
                config.pass.length,

            smtpHost:
                config.host,

            smtpPort:
                config.port,

            secure:
                config.secure,

            frontendUrl:
                config.frontendUrl
        };
    }

    // =================================================
    // VERIFY SMTP
    // =================================================

    async verifySMTP() {
        return await verifySMTP();
    }

    // =================================================
    // SHOPKEEPER CREDENTIALS
    // =================================================

    async sendShopkeeperCredentials(
        shopkeeper,
        password,
        ownerName
    ) {
        try {
            if (!shopkeeper) {
                throw new Error(
                    "Shopkeeper data is missing"
                );
            }

            if (!shopkeeper.email) {
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

            const config =
                getEmailConfig();

            const loginUrl =
                `${config.frontendUrl}/login`;

            const subject =
                "DukaFasta Shopkeeper Account";

            // =================================================
            // TEXT
            // =================================================

            const text = `
Hello ${name},

Your DukaFasta shopkeeper account has been created successfully.

Created by:
${creator}

LOGIN DETAILS

Email:
${shopkeeper.email}

Password:
${password}

Login:
${loginUrl}

Please change your password after your first login.

DukaFasta Team
`;

            // =================================================
            // HTML
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
padding:30px;
background:#f5f5f5;
font-family:Arial,Helvetica,sans-serif;
">

<div style="
max-width:600px;
margin:auto;
background:#ffffff;
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
Hello
<strong>${name}</strong>,
</p>

<p>
Your DukaFasta shopkeeper account has been created by
<strong>${creator}</strong>.
</p>

<div style="
background:#f3f4f6;
padding:20px;
border-radius:8px;
margin:20px 0;
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

<strong>Important:</strong>
Please change your password after your first login.

</p>

<div style="
text-align:center;
margin:30px 0;
">

<a
href="${loginUrl}"
style="
display:inline-block;
background:#2563eb;
color:#ffffff;
text-decoration:none;
padding:14px 25px;
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
font-size:12px;
color:#777;
">

© ${new Date().getFullYear()} DukaFasta

</p>

</div>

</body>

</html>
`;

            return await sendMail({
                to:
                    shopkeeper.email,

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

                messageId: null,

                error:
                    error.message
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
                user.firstName ||
                "Customer";

            const subject =
                "Welcome to DukaFasta 🎉";

            const text = `
Hello ${name},

Your DukaFasta account has been created successfully.

You can now log in and start shopping.

DukaFasta Team
`;

            const html = `
<!DOCTYPE html>

<html>

<body style="
font-family:Arial,sans-serif;
background:#f5f5f5;
padding:30px;
">

<div style="
max-width:600px;
margin:auto;
background:white;
padding:30px;
border-radius:10px;
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

</body>

</html>
`;

            return await sendMail({
                to:
                    user.email,

                subject,

                text,

                html
            });

        } catch (error) {
            return {
                success: false,

                email:
                    user?.email || null,

                messageId: null,

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
                    "Email is required"
                );
            }

            if (!otp) {
                throw new Error(
                    "OTP is required"
                );
            }

            const name =
                firstName ||
                "Customer";

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
<!DOCTYPE html>

<html>

<body style="
font-family:Arial,sans-serif;
background:#f5f5f5;
padding:30px;
">

<div style="
max-width:600px;
margin:auto;
background:white;
padding:30px;
border-radius:10px;
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

</body>

</html>
`;

            return await sendMail({
                to:
                    email,

                subject,

                text,

                html
            });

        } catch (error) {
            return {
                success: false,

                email,

                messageId: null,

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
                    "Email is required"
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
contact support immediately.

DukaFasta Team
`;

            const html = `
<!DOCTYPE html>

<html>

<body style="
font-family:Arial,sans-serif;
background:#f5f5f5;
padding:30px;
">

<div style="
max-width:600px;
margin:auto;
background:white;
padding:30px;
border-radius:10px;
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

</body>

</html>
`;

            return await sendMail({
                to:
                    email,

                subject,

                text,

                html
            });

        } catch (error) {
            return {
                success: false,

                email,

                messageId: null,

                error:
                    error.message
            };
        }
    }

    // =================================================
    // TEST EMAIL
    // =================================================

    async testEmailConfiguration(testEmail) {
        if (!testEmail) {
            return {
                success: false,

                email: null,

                messageId: null,

                error:
                    "Test email is required"
            };
        }

        return await sendMail({
            to:
                testEmail,

            subject:
                "DukaFasta Email Test",

            text: `
DukaFasta Gmail SMTP test.

If you received this email,
your SMTP configuration is working correctly.
`,

            html: `
<!DOCTYPE html>

<html>

<body style="
font-family:Arial,sans-serif;
padding:30px;
">

<h2 style="color:#2563eb;">
DukaFasta Email Test
</h2>

<p>
Gmail SMTP is working correctly.
</p>

</body>

</html>
`
        });
    }
}

// =====================================================
// CREATE SERVICE INSTANCE
// =====================================================

const emailService =
    new EmailService();

// =====================================================
// INITIAL CONFIGURATION LOG
// =====================================================

logEmailConfiguration();

// =====================================================
// EXPORT
// =====================================================

module.exports =
    emailService;