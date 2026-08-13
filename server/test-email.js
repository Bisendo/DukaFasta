require("dotenv").config();

const nodemailer = require("nodemailer");

console.log("========================================");
console.log("GMAIL SMTP TEST");
console.log("========================================");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
    "EMAIL_PASS configured:",
    Boolean(process.env.EMAIL_PASS)
);
console.log(
    "EMAIL_PASS length:",
    process.env.EMAIL_PASS
        ? process.env.EMAIL_PASS.length
        : 0
);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    family: 4,

    tls: {
        servername: "smtp.gmail.com",
        minVersion: "TLSv1.2"
    }
});

async function test() {

    try {

        console.log("");
        console.log("🔄 Verifying Gmail SMTP...");

        await transporter.verify();

        console.log("✅ SMTP CONNECTION SUCCESSFUL");

        console.log("");
        console.log("📧 Sending test email...");

        const info = await transporter.sendMail({

            from: `"DukaFasta" <${process.env.EMAIL_USER}>`,

            to: process.env.EMAIL_USER,

            subject: "DukaFasta SMTP Test",

            text: `
DukaFasta SMTP test successful.

Your Gmail SMTP configuration is working correctly.
`,

            html: `
<div style="font-family:Arial;padding:30px">

<h2>DukaFasta SMTP Test</h2>

<p>
<strong>Success!</strong>
</p>

<p>
Your Gmail SMTP configuration is working correctly.
</p>

</div>
`

        });

        console.log("");
        console.log("========================================");
        console.log("✅ EMAIL SENT SUCCESSFULLY");
        console.log("========================================");

        console.log("Message ID:", info.messageId);

        console.log("Accepted:", info.accepted);

        console.log("Rejected:", info.rejected);

        console.log("========================================");

    } catch (error) {

        console.log("");
        console.log("========================================");
        console.log("❌ EMAIL TEST FAILED");
        console.log("========================================");

        console.log("Message:", error.message);
        console.log("Code:", error.code);
        console.log("Response:", error.response);
        console.log("Response Code:", error.responseCode);

        console.log("========================================");

    }
}

test();
