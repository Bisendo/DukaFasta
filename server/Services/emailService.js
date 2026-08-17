// services/emailService.js
// =====================================================
// DukaFasta - Complete Email Service
// =====================================================

"use strict";

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

const path = require("path");
const dotenv = require("dotenv");

// Load .env from the server directory
const envPath = path.join(__dirname, "../.env");
dotenv.config({ path: envPath });

// Verify email configuration
console.log("========================================");
console.log("📧 EMAIL SERVICE INITIALIZATION");
console.log("========================================");
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ SET (length: ' + process.env.EMAIL_PASS.length + ')' : '❌ NOT SET'}`);
console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
console.log("========================================\n");

// =====================================================
// IMPORT MODULES
// =====================================================

const nodemailer = require("nodemailer");

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

function getEmailConfig() {
    return {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // Use STARTTLS for port 587
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000"
    };
}

// =====================================================
// VALIDATE CONFIGURATION
// =====================================================

function validateConfig() {
    const config = getEmailConfig();
    const errors = [];

    if (!config.user) errors.push("EMAIL_USER is missing");
    if (!config.pass) errors.push("EMAIL_PASS is missing");
    if (config.pass && config.pass.length < 10) errors.push("EMAIL_PASS is too short (should be at least 10 characters)");
    if (!config.host) errors.push("EMAIL_HOST is missing");
    if (!config.port) errors.push("EMAIL_PORT is missing");

    if (errors.length > 0) {
        return {
            valid: false,
            errors: errors
        };
    }

    return {
        valid: true,
        config: config
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
        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: config.user,
            pass: config.pass
        },
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });
}

// =====================================================
// SEND EMAIL FUNCTION
// =====================================================

async function sendEmail({ to, subject, text, html }) {
    const validation = validateConfig();
    
    if (!validation.valid) {
        console.error("❌ Email configuration invalid:", validation.errors);
        return {
            success: false,
            error: validation.errors.join(", ")
        };
    }

    const config = validation.config;

    if (!to) {
        return {
            success: false,
            error: "Recipient email is required"
        };
    }

    if (!subject) {
        return {
            success: false,
            error: "Email subject is required"
        };
    }

    const transporter = createTransporter();

    try {
        console.log(`📧 Sending email to: ${to}`);
        console.log(`📧 Subject: ${subject}`);

        const mailOptions = {
            from: `"DukaFasta" <${config.user}>`,
            to: to,
            subject: subject,
            text: text || "",
            html: html || ""
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email sent successfully!`);
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📧 Accepted: ${info.accepted?.join(', ') || 'N/A'}`);

        return {
            success: true,
            messageId: info.messageId,
            accepted: info.accepted || [],
            rejected: info.rejected || []
        };

    } catch (error) {
        console.error(`❌ Failed to send email:`, error.message);
        
        let errorMessage = error.message;
        
        // Handle common Gmail errors
        if (error.message.includes('535')) {
            errorMessage = 'Gmail authentication failed. Please check your email password or App Password.';
        } else if (error.message.includes('connect ECONNREFUSED')) {
            errorMessage = 'Could not connect to SMTP server. Please check your network connection.';
        } else if (error.message.includes('ETIMEDOUT')) {
            errorMessage = 'Connection to SMTP server timed out. Please check your network.';
        }

        return {
            success: false,
            error: errorMessage,
            details: error.message
        };
    } finally {
        transporter.close();
    }
}

// =====================================================
// EMAIL SERVICE CLASS
// =====================================================

class EmailService {
    // Get configuration status
    getStatus() {
        const validation = validateConfig();
        return {
            configured: validation.valid,
            errors: validation.errors || [],
            config: validation.valid ? {
                user: validation.config.user,
                host: validation.config.host,
                port: validation.config.port,
                secure: validation.config.secure
            } : null
        };
    }

    // Verify SMTP connection
    async verifyConnection() {
        const validation = validateConfig();
        
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(", ")
            };
        }

        const transporter = createTransporter();

        try {
            console.log("🔄 Verifying SMTP connection...");
            await transporter.verify();
            console.log("✅ SMTP connection verified successfully!");
            return {
                success: true,
                message: "SMTP connection verified successfully"
            };
        } catch (error) {
            console.error("❌ SMTP verification failed:", error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            transporter.close();
        }
    }

    // Send shopkeeper credentials
    async sendShopkeeperCredentials(shopkeeper, password, ownerName) {
        try {
            if (!shopkeeper) {
                throw new Error("Shopkeeper data is missing");
            }

            if (!shopkeeper.email) {
                throw new Error("Shopkeeper email is missing");
            }

            if (!password) {
                throw new Error("Password is missing");
            }

            const name = shopkeeper.firstName || shopkeeper.first_name || "Shopkeeper";
            const creator = ownerName || "DukaFasta Administrator";
            const config = getEmailConfig();
            const loginUrl = `${config.frontendUrl}/login`;

            const subject = "Welcome to DukaFasta - Your Shopkeeper Account";

            const text = `
Hello ${name},

Your DukaFasta shopkeeper account has been created successfully!

Created by: ${creator}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${shopkeeper.email}
Password: ${password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Login URL: ${loginUrl}

⚠️ IMPORTANT: Please change your password after your first login.

Best regards,
DukaFasta Team
`;

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DukaFasta Shopkeeper Account</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0 0; }
        .details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .details p { margin: 10px 0; }
        .details strong { color: #1e293b; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .warning strong { color: #92400e; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 DukaFasta</h1>
            <p>Shopkeeper Account Created</p>
        </div>

        <p>Hello <strong>${name}</strong>,</p>

        <p>Your DukaFasta shopkeeper account has been created successfully!</p>

        <p><strong>Created by:</strong> ${creator}</p>

        <div class="details">
            <h3 style="margin-top: 0; color: #1e293b;">Login Details</h3>
            <p><strong>Email:</strong> ${shopkeeper.email}</p>
            <p><strong>Password:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
        </div>

        <div class="warning">
            <strong>⚠️ Important:</strong>
            <p style="margin: 5px 0 0;">Please change your password after your first login.</p>
        </div>

        <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to DukaFasta</a>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">${loginUrl}</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DukaFasta. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

            const result = await sendEmail({
                to: shopkeeper.email,
                subject: subject,
                text: text,
                html: html
            });

            if (result.success) {
                console.log(`✅ Shopkeeper credentials sent to: ${shopkeeper.email}`);
            } else {
                console.error(`❌ Failed to send shopkeeper credentials: ${result.error}`);
            }

            return result;

        } catch (error) {
            console.error("❌ Error in sendShopkeeperCredentials:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send welcome email
    async sendWelcomeEmail(user) {
        try {
            if (!user?.email) {
                throw new Error("User email is missing");
            }

            const name = user.firstName || user.first_name || "Customer";

            const subject = "Welcome to DukaFasta! 🎉";

            const text = `
Hello ${name},

Welcome to DukaFasta!

Your account has been created successfully. You can now start shopping and exploring our platform.

If you have any questions, feel free to contact our support team.

Best regards,
DukaFasta Team
`;

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to DukaFasta</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 DukaFasta</h1>
            <p>Welcome to the family!</p>
        </div>

        <p>Hello <strong>${name}</strong>,</p>

        <p>Welcome to DukaFasta!</p>

        <p>Your account has been created successfully. You can now start shopping and exploring our platform.</p>

        <p>If you have any questions, feel free to contact our support team.</p>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DukaFasta. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

            return await sendEmail({
                to: user.email,
                subject: subject,
                text: text,
                html: html
            });

        } catch (error) {
            console.error("❌ Error in sendWelcomeEmail:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send OTP email
    async sendOTPEmail(email, otp, firstName) {
        try {
            if (!email) {
                throw new Error("Email is required");
            }

            if (!otp) {
                throw new Error("OTP is required");
            }

            const name = firstName || "Customer";

            const subject = "Password Reset OTP - DukaFasta";

            const text = `
Hello ${name},

Your verification code is: ${otp}

This code expires in 10 minutes.

If you did not request this, please ignore this email.

Best regards,
DukaFasta Team
`;

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .otp { text-align: center; font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #2563eb; padding: 20px; background: #f0f7ff; border-radius: 8px; margin: 20px 0; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .warning p { margin: 5px 0; color: #92400e; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 DukaFasta</h1>
            <p>Password Reset</p>
        </div>

        <p>Hello <strong>${name}</strong>,</p>

        <p>Your verification code is:</p>

        <div class="otp">${otp}</div>

        <div class="warning">
            <p>⚠️ This code expires in <strong>10 minutes</strong>.</p>
            <p style="font-size: 12px; margin-top: 5px;">If you did not request this, please ignore this email.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DukaFasta. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

            return await sendEmail({
                to: email,
                subject: subject,
                text: text,
                html: html
            });

        } catch (error) {
            console.error("❌ Error in sendOTPEmail:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Send password reset confirmation
    async sendPasswordResetConfirmation(email, firstName) {
        try {
            if (!email) {
                throw new Error("Email is required");
            }

            const name = firstName || "Customer";

            const subject = "Password Changed Successfully - DukaFasta";

            const text = `
Hello ${name},

Your DukaFasta password has been changed successfully.

If you did not make this change, please contact our support team immediately.

Best regards,
DukaFasta Team
`;

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .success { background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .success p { margin: 5px 0; color: #065f46; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 DukaFasta</h1>
            <p>Password Changed</p>
        </div>

        <p>Hello <strong>${name}</strong>,</p>

        <div class="success">
            <p>✅ Your password has been changed successfully.</p>
        </div>

        <p style="color: #dc2626; font-size: 14px;">⚠️ If you did not make this change, please contact our support team immediately.</p>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DukaFasta. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

            return await sendEmail({
                to: email,
                subject: subject,
                text: text,
                html: html
            });

        } catch (error) {
            console.error("❌ Error in sendPasswordResetConfirmation:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Test email configuration
    async testConfiguration(testEmail) {
        if (!testEmail) {
            return {
                success: false,
                error: "Test email address is required"
            };
        }

        const subject = "DukaFasta Email Test";

        const text = `
This is a test email from DukaFasta.

If you received this email, your SMTP configuration is working correctly!

Best regards,
DukaFasta Team
`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Test</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 30px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .success { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; text-align: center; }
        .success p { margin: 5px 0; color: #065f46; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 DukaFasta</h1>
            <p>Email Test</p>
        </div>

        <div class="success">
            <p>✅ Email Configuration is Working!</p>
        </div>

        <p>If you received this email, your SMTP configuration is working correctly!</p>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DukaFasta. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

        return await sendEmail({
            to: testEmail,
            subject: subject,
            text: text,
            html: html
        });
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = new EmailService();