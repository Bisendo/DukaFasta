// =====================================================
// DukaFasta - Email Service
// Gmail SMTP + IPv4 + STARTTLS
// =====================================================

require("dotenv").config();

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
// ENVIRONMENT
// =====================================================

const EMAIL_USER =
    String(process.env.EMAIL_USER || "").trim();

const EMAIL_PASS =
    String(process.env.EMAIL_PASS || "").trim();

const FRONTEND_URL =
    String(
        process.env.FRONTEND_URL ||
        "http://localhost:3000"
    ).trim();

// =====================================================
// EMAIL CONFIGURATION LOG
// =====================================================

console.log("");
console.log("========================================");
console.log("📧 DUKAFASTA EMAIL CONFIGURATION");
console.log("========================================");

console.log(
    "EMAIL_USER:",
    EMAIL_USER || "NOT SET"
);

console.log(
    "EMAIL_PASS configured:",
    Boolean(EMAIL_PASS)
);

console.log(
    "EMAIL_PASS length:",
    EMAIL_PASS.length
);

console.log(
    "FRONTEND_URL:",
    FRONTEND_URL
);

console.log(
    "SMTP HOST:",
    "smtp.gmail.com"
);

console.log(
    "SMTP PORT:",
    587
);

console.log(
    "SMTP SECURITY:",
    "STARTTLS"
);

console.log(
    "IP FAMILY:",
    "IPv4"
);

console.log("========================================");
console.log("");

// =====================================================
// CREATE SMTP TRANSPORTER
// =====================================================
//
// Gmail:
// Host: smtp.gmail.com
// Port: 587
// Security: STARTTLS
//
// This configuration was tested successfully
// with your test-email.js.
// =====================================================

const transporter =
    nodemailer.createTransport({

        host: "smtp.gmail.com",

        port: 587,

        secure: false,

        requireTLS: true,

        family: 4,

        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        },

        connectionTimeout: 10000,

        greetingTimeout: 10000,

        socketTimeout: 15000,

        dnsTimeout: 5000,

        tls: {
            servername: "smtp.gmail.com",
            minVersion: "TLSv1.2"
        }

    });

// =====================================================
// VERIFY SMTP
// =====================================================

async function verifySMTP() {

    if (!EMAIL_USER) {

        return {
            success: false,
            error:
                "EMAIL_USER is missing from .env"
        };

    }

    if (!EMAIL_PASS) {

        return {
            success: false,
            error:
                "EMAIL_PASS is missing from .env"
        };

    }

    try {

        console.log(
            "🔄 Verifying Gmail SMTP connection..."
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

        return {
            success: false,
            error:
                getFriendlyError(error),
            details:
                error.message,
            code:
                error.code || null
        };
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

    // =================================================
    // VALIDATION
    // =================================================

    if (!EMAIL_USER) {

        return {
            success: false,
            email: to || null,
            messageId: null,
            error:
                "EMAIL_USER is missing from .env"
        };

    }

    if (!EMAIL_PASS) {

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
    // SEND
    // =================================================

    try {

        console.log("");
        console.log("========================================");
        console.log("📧 SENDING EMAIL");
        console.log("========================================");

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
            "smtp.gmail.com:587"
        );

        console.log(
            "IPv4:",
            "enabled"
        );

        console.log("========================================");

        const info =
            await transporter.sendMail({

                from:
                    `"DukaFasta" <${EMAIL_USER}>`,

                to,

                subject,

                text,

                html

            });

        // =================================================
        // CHECK ACCEPTED / REJECTED
        // =================================================

        const accepted =
            Array.isArray(info.accepted)
                ? info.accepted
                : [];

        const rejected =
            Array.isArray(info.rejected)
                ? info.rejected
                : [];

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

            rejected

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

    }
}

// =====================================================
// EMAIL SERVICE CLASS
// =====================================================

class EmailService {

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

            const loginUrl =
                `${FRONTEND_URL}/login`;

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
// EXPORT
// =====================================================

module.exports =
    new EmailService();