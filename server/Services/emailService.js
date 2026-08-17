// =====================================================
// DukaFasta - Email Service
// Gmail SMTP + IPv4 + STARTTLS
// =====================================================

"use strict";

const nodemailer = require("nodemailer");
const dns = require("dns");

// =====================================================
// FORCE IPv4
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
// GET EMAIL CONFIGURATION
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
// CONFIGURATION STATUS
// =====================================================

function getConfiguration() {
    const config = getEmailConfig();

    return {
        emailUserConfigured: Boolean(config.user),
        emailPassConfigured: Boolean(config.pass),
        emailPassLength: config.pass.length,
        smtpHost: config.host,
        smtpPort: config.port,
        smtpSecure: config.secure,
        frontendUrl: config.frontendUrl
    };
}

// =====================================================
// CREATE TRANSPORTER
// =====================================================

function createTransporter() {
    const config = getEmailConfig();

    return nodemailer.createTransport({
        host: config.host,

        port: config.port,

        secure: config.secure,

        // Port 587 uses STARTTLS
        requireTLS: !config.secure,

        family: 4,

        auth: {
            user: config.user,
            pass: config.pass
        },

        connectionTimeout: 15000,

        greetingTimeout: 15000,

        socketTimeout: 20000,

        dnsTimeout: 10000,

        tls: {
            servername: config.host,
            minVersion: "TLSv1.2"
        }
    });
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
            "Check your server network connection."
        );
    }

    if (error.code === "ENETUNREACH") {
        return (
            "The server cannot reach Gmail SMTP. " +
            "Check IPv4/network routing."
        );
    }

    if (
        error.code === "ECONNECTION" ||
        error.code === "ECONNREFUSED"
    ) {
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
        "Email sending failed."
    );
}

// =====================================================
// VERIFY SMTP
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

    console.log(
        "SECURE:",
        config.secure
    );

    console.log("========================================");

    if (!config.user) {
        return {
            success: false,
            error:
                "EMAIL_USER is missing from environment variables."
        };
    }

    if (!config.pass) {
        return {
            success: false,
            error:
                "EMAIL_PASS is missing from environment variables."
        };
    }

    const transporter = createTransporter();

    try {
        console.log(
            "🔄 Connecting to Gmail SMTP..."
        );

        await transporter.verify();

        console.log(
            "✅ Gmail SMTP connection successful"
        );

        return {
            success: true,
            message:
                "Gmail SMTP connection successful"
        };

    } catch (error) {
        console.error(
            "❌ Gmail SMTP verification failed:",
            error.message
        );

        return {
            success: false,
            error: getFriendlyError(error),
            details: error.message,
            code: error.code || null,
            responseCode:
                error.responseCode || null
        };

    } finally {
        try {
            transporter.close();
        } catch (_) {
            // Ignore close error
        }
    }
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
    // VALIDATION
    // =================================================

    if (!config.user) {
        return {
            success: false,
            email: to || null,
            messageId: null,
            error:
                "EMAIL_USER is missing from environment variables."
        };
    }

    if (!config.pass) {
        return {
            success: false,
            email: to || null,
            messageId: null,
            error:
                "EMAIL_PASS is missing from environment variables."
        };
    }

    if (!to) {
        return {
            success: false,
            email: null,
            messageId: null,
            error:
                "Recipient email is required."
        };
    }

    if (!subject) {
        return {
            success: false,
            email: to,
            messageId: null,
            error:
                "Email subject is required."
        };
    }

    // =================================================
    // CREATE TRANSPORTER
    // =================================================

    const transporter = createTransporter();

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
            await transporter.sendMail({
                from:
                    `"DukaFasta" <${config.user}>`,

                to,

                subject,

                text,

                html
            });

        const accepted =
            Array.isArray(info.accepted)
                ? info.accepted
                : [];

        const rejected =
            Array.isArray(info.rejected)
                ? info.rejected
                : [];

        // =================================================
        // REJECTED
        // =================================================

        if (
            rejected.length > 0 &&
            accepted.length === 0
        ) {
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
            responseCode:
                error.responseCode || null
        };

    } finally {
        try {
            transporter.close();
        } catch (_) {
            // Ignore close error
        }
    }
}

// =====================================================
// EMAIL SERVICE CLASS
// =====================================================

class EmailService {

    // =================================================
    // CONFIGURATION
    // =================================================

    getConfiguration() {
        return getConfiguration();
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
                    "Shopkeeper data is missing."
                );
            }

            if (!shopkeeper.email) {
                throw new Error(
                    "Shopkeeper email is missing."
                );
            }

            if (!password) {
                throw new Error(
                    "Shopkeeper password is missing."
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
Hello <strong>${name}</strong>,
</p>

<p>
Your DukaFasta shopkeeper account has been created successfully.
</p>

<p>
Created by:
<strong>${creator}</strong>
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
                    "User email is missing."
                );
            }

            const name =
                user.firstName ||
                "Customer";

            return await sendMail({
                to: user.email,

                subject:
                    "Welcome to DukaFasta 🎉",

                text: `
Hello ${name},

Your DukaFasta account has been created successfully.

You can now log in and start shopping.

DukaFasta Team
`,

                html: `
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
`
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
                    "Email is required."
                );
            }

            if (!otp) {
                throw new Error(
                    "OTP is required."
                );
            }

            const name =
                firstName ||
                "Customer";

            return await sendMail({
                to: email,

                subject:
                    "Password Reset OTP - DukaFasta",

                text: `
Hello ${name},

Your DukaFasta verification code is:

${otp}

This code expires in 10 minutes.

DukaFasta Team
`,

                html: `
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
`
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
                    "Email is required."
                );
            }

            const name =
                firstName ||
                "Customer";

            return await sendMail({
                to: email,

                subject:
                    "Password Changed Successfully - DukaFasta",

                text: `
Hello ${name},

Your DukaFasta password has been changed successfully.

If you did not make this change,
contact support immediately.

DukaFasta Team
`,

                html: `
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
`
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
                    "Test email is required."
            };
        }

        return await sendMail({
            to: testEmail,

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
// EXPORT
// =====================================================

module.exports =
    new EmailService();