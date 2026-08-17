// =====================================================
// DukaFasta - Email Controller
// =====================================================

"use strict";

const emailService =
    require("../Services/emailService");

// =====================================================
// EMAIL CONTROLLER
// =====================================================

class EmailController {

    // =================================================
    // TEST EMAIL
    // =================================================

    async testEmail(req, res) {
        try {
            const testEmail =
                String(
                    req.query.email || ""
                ).trim();

            // -------------------------------------------------
            // SEND ACTUAL TEST EMAIL
            // -------------------------------------------------

            if (testEmail) {

                console.log(
                    "🧪 Sending test email to:",
                    testEmail
                );

                const result =
                    await emailService.testEmailConfiguration(
                        testEmail
                    );

                if (result.success) {

                    return res.status(200).json({
                        success: true,

                        message:
                            "Test email sent successfully",

                        data: {
                            to: testEmail,

                            messageId:
                                result.messageId,

                            details: result
                        }
                    });

                }

                return res.status(500).json({
                    success: false,

                    message:
                        "Test email failed",

                    error:
                        result.error,

                    details:
                        result
                });
            }

            // -------------------------------------------------
            // ONLY CHECK CONFIGURATION
            // -------------------------------------------------

            const config =
                emailService.getConfiguration();

            const verification =
                await emailService.verifySMTP();

            return res.status(200).json({

                success:
                    verification.success,

                message:
                    verification.success
                        ? "Email service is ready"
                        : "Email service is not ready",

                configuration: config,

                verification

            });

        } catch (error) {

            console.error(
                "❌ Test email error:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }

    // =================================================
    // EMAIL STATUS
    // =================================================

    async emailStatus(req, res) {
        try {

            const config =
                emailService.getConfiguration();

            const verification =
                await emailService.verifySMTP();

            return res.status(200).json({

                success: true,

                status:
                    verification.success
                        ? "ready"
                        : "error",

                configuration: config,

                verification

            });

        } catch (error) {

            console.error(
                "❌ Email status error:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }

    // =================================================
    // SEND WELCOME EMAIL
    // =================================================

    async sendWelcome(req, res) {
        try {

            const {
                firstName,
                lastName,
                email,
                role
            } = req.body;

            if (!email || !role) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Email and role are required."
                });
            }

            const user = {
                firstName:
                    firstName || "User",

                lastName:
                    lastName || "",

                email,

                role
            };

            console.log(
                "📧 Sending welcome email to:",
                email
            );

            const result =
                await emailService.sendWelcomeEmail(
                    user
                );

            if (!result.success) {

                return res.status(500).json({
                    success: false,

                    error:
                        result.error ||
                        "Failed to send welcome email.",

                    details:
                        result
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Welcome email sent successfully.",

                data: {
                    to: email,

                    messageId:
                        result.messageId,

                    details:
                        result
                }

            });

        } catch (error) {

            console.error(
                "❌ Welcome email error:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    "Failed to send welcome email.",
                details:
                    error.message
            });
        }
    }

    // =================================================
    // SEND SHOPKEEPER CREDENTIALS
    // =================================================

    async sendShopkeeperCredentials(
        req,
        res
    ) {
        try {

            const {
                to,
                firstName,
                lastName,
                password,
                ownerName
            } = req.body;

            if (!to) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Recipient email is required."
                });
            }

            if (!password) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Shopkeeper password is required."
                });
            }

            if (!ownerName) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Owner name is required."
                });
            }

            const shopkeeper = {

                firstName:
                    firstName || "Shopkeeper",

                lastName:
                    lastName || "",

                email:
                    to

            };

            console.log(
                "📧 Sending shopkeeper credentials to:",
                to
            );

            console.log(
                "👤 Created by:",
                ownerName
            );

            const result =
                await emailService.sendShopkeeperCredentials(
                    shopkeeper,
                    password,
                    ownerName
                );

            if (!result.success) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Shopkeeper was created, but the email could not be sent.",

                    emailSent: false,

                    emailError:
                        result.error,

                    emailMessageId:
                        result.messageId || null,

                    details:
                        result

                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Shopkeeper credentials email sent successfully.",

                emailSent: true,

                emailMessageId:
                    result.messageId,

                emailError: null,

                shopkeeperEmail:
                    to

            });

        } catch (error) {

            console.error(
                "❌ Shopkeeper credentials email error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to send shopkeeper credentials email.",

                emailSent: false,

                emailError:
                    error.message,

                emailMessageId:
                    null

            });
        }
    }

    // =================================================
    // PASSWORD RESET CONFIRMATION
    // =================================================

    async sendPasswordReset(req, res) {
        try {

            const {
                email,
                newPassword,
                firstName
            } = req.body;

            if (!email || !newPassword) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Email and newPassword are required."
                });
            }

            const result =
                await emailService.sendPasswordResetConfirmation(
                    email,
                    firstName || "User"
                );

            if (!result.success) {

                return res.status(500).json({
                    success: false,
                    error:
                        result.error,
                    details:
                        result
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Password reset confirmation email sent successfully.",

                data: {
                    to: email,

                    messageId:
                        result.messageId
                }

            });

        } catch (error) {

            console.error(
                "❌ Password reset email error:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }

    // =================================================
    // PASSWORD RESET OTP
    // =================================================

    async sendPasswordResetOTP(req, res) {
        try {

            const {
                email,
                otp,
                firstName
            } = req.body;

            if (!email || !otp) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Email and OTP are required."
                });
            }

            console.log(
                "📧 Sending password reset OTP to:",
                email
            );

            const result =
                await emailService.sendOTPEmail(
                    email,
                    otp,
                    firstName || "User"
                );

            if (!result.success) {

                return res.status(500).json({
                    success: false,
                    error:
                        result.error,
                    details:
                        result
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "Password reset OTP sent successfully.",

                data: {
                    to: email,

                    messageId:
                        result.messageId
                }

            });

        } catch (error) {

            console.error(
                "❌ OTP email error:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports =
    new EmailController();