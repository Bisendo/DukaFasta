require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models");
const EmailService = require("../Services/emailService");

// =====================================================
// CONFIGURATION
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn(
        "⚠️ JWT_SECRET is not configured. Please add JWT_SECRET to .env"
    );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const cleanString = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
};

const cleanEmail = (email) => {
    return cleanString(email).toLowerCase();
};

// =====================================================
// LOGIN
// POST /users/login
// =====================================================

router.post("/login", async (req, res) => {
    try {
        const email = cleanEmail(req.body.email);
        const password = cleanString(req.body.password);

        // -----------------------------
        // Validate input
        // -----------------------------

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        // -----------------------------
        // Find user
        // -----------------------------

        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // -----------------------------
        // Check password
        // -----------------------------

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // -----------------------------
        // Create JWT
        // -----------------------------

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email,
                firstName: user.firstName
            },
            JWT_SECRET || "temporary-secret",
            {
                expiresIn: "7d"
            }
        );

        // -----------------------------
        // Response
        // -----------------------------

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,

            user: {
                id: user.id,
                role: user.role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                ownerId: user.ownerId
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// =====================================================
// CREATE BUSINESS OWNER
// POST /users/owner
// =====================================================

router.post("/owner", async (req, res) => {
    try {
        const firstName = cleanString(req.body.firstName);
        const lastName = cleanString(req.body.lastName);
        const email = cleanEmail(req.body.email);
        const phoneNumber = cleanString(req.body.phoneNumber);
        const password = cleanString(req.body.password);

        console.log("=================================");
        console.log("🚀 OWNER REGISTRATION REQUEST");
        console.log("First Name:", firstName);
        console.log("Last Name:", lastName);
        console.log("Email:", email);
        console.log("Phone:", phoneNumber);
        console.log("=================================");

        // =================================================
        // VALIDATE INPUT
        // =================================================

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phoneNumber ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // =================================================
        // VALIDATE PASSWORD
        // =================================================

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters"
            });
        }

        // =================================================
        // CHECK EXISTING EMAIL
        // =================================================

        const existingUser = await User.findOne({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Email already exists"
            });
        }

        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // =================================================
        // CREATE OWNER
        // =================================================

        const owner = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: "owner"
        });

        console.log(
            `✅ Owner created: ${owner.email}`
        );

        // =================================================
        // SEND WELCOME EMAIL
        // =================================================

        let emailSent = false;
        let emailError = null;
        let emailMessageId = null;

        try {
            console.log("=================================");
            console.log("📧 Sending owner welcome email");
            console.log("To:", owner.email);
            console.log("=================================");

            const emailResult =
                await EmailService.sendWelcomeEmail(owner);

            if (
                emailResult &&
                emailResult.success === true
            ) {
                emailSent = true;

                emailMessageId =
                    emailResult.messageId || null;

                console.log("=================================");
                console.log("✅ WELCOME EMAIL SENT SUCCESSFULLY");
                console.log("To:", owner.email);
                console.log(
                    "Message ID:",
                    emailMessageId
                );
                console.log("=================================");

            } else {
                emailError =
                    emailResult?.error ||
                    "Email service failed to send the welcome email";

                console.error("=================================");
                console.error("❌ WELCOME EMAIL FAILED");
                console.error("To:", owner.email);
                console.error("Error:", emailError);
                console.error("=================================");
            }

        } catch (error) {

            emailError =
                error.message ||
                "Unknown email error";

            console.error("=================================");
            console.error("❌ WELCOME EMAIL ERROR");
            console.error("Error:", error);
            console.error("=================================");
        }

        // =================================================
        // FINAL RESPONSE
        // =================================================

        const responseMessage = emailSent
            ? "Owner created successfully. Welcome email sent."
            : "Owner created successfully, but the welcome email could not be sent.";

        return res.status(201).json({
            success: true,

            message: responseMessage,

            // IMPORTANT FOR REACT
            emailSent: emailSent,

            emailError: emailSent
                ? null
                : emailError,

            emailMessageId: emailMessageId,

            owner: {
                id: owner.id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                email: owner.email,
                phoneNumber: owner.phoneNumber,
                role: owner.role,
                createdAt: owner.createdAt
            }
        });

    } catch (error) {

        console.error(
            "❌ Owner creation error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to create owner"
        });
    }
});

// =====================================================
// CREATE SHOPKEEPER
// POST /users/shopkeeper/:ownerId
// =====================================================

router.post("/shopkeeper/:ownerId", async (req, res) => {
    try {
        const firstName = cleanString(req.body.firstName);
        const lastName = cleanString(req.body.lastName);
        const email = cleanEmail(req.body.email);
        const phoneNumber = cleanString(req.body.phoneNumber);
        const password = cleanString(req.body.password);

        const ownerId = cleanString(req.params.ownerId);

        // -----------------------------
        // Validate input
        // -----------------------------

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phoneNumber ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters"
            });
        }

        // -----------------------------
        // Check owner
        // -----------------------------

        const owner = await User.findByPk(ownerId);

        if (!owner) {
            return res.status(404).json({
                success: false,
                error: "Owner not found"
            });
        }

        if (owner.role !== "owner") {
            return res.status(400).json({
                success: false,
                error: "Selected user is not an owner"
            });
        }

        // -----------------------------
        // Check email
        // -----------------------------

        const existingUser = await User.findOne({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Email already exists"
            });
        }

        // -----------------------------
        // Hash password
        // -----------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // -----------------------------
        // Create shopkeeper
        // -----------------------------

        const shopkeeper = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: "shopkeeper",
            ownerId
        });

        console.log(
            `✅ Shopkeeper created: ${shopkeeper.email}`
        );

        // =================================================
        // SEND SHOPKEEPER EMAIL
        // =================================================

        let emailSent = false;
        let emailError = null;
        let emailMessageId = null;

        try {
            const shopkeeperData = {
                firstName: shopkeeper.firstName,
                lastName: shopkeeper.lastName,
                email: shopkeeper.email,
                phoneNumber: shopkeeper.phoneNumber,
                role: shopkeeper.role
            };

            const ownerName =
                `${owner.firstName} ${owner.lastName}`;

            const emailResult =
                await EmailService.sendShopkeeperCredentials(
                    shopkeeperData,
                    password,
                    ownerName
                );

            if (
                emailResult &&
                emailResult.success === true
            ) {
                emailSent = true;

                emailMessageId =
                    emailResult.messageId || null;

                console.log(
                    `✅ Shopkeeper email sent to: ${shopkeeper.email}`
                );

            } else {
                emailError =
                    emailResult?.error ||
                    "Email service failed";
            }

        } catch (emailErrorObject) {

            emailError =
                emailErrorObject.message ||
                "Unknown email error";

            console.error(
                "❌ Shopkeeper email error:",
                emailErrorObject
            );
        }

        // -----------------------------
        // Response
        // -----------------------------

        return res.status(201).json({
            success: true,

            message: emailSent
                ? "Shopkeeper created successfully. Login credentials were sent by email."
                : "Shopkeeper created successfully, but the email could not be sent.",

            emailSent,

            emailError: emailSent
                ? null
                : emailError,

            emailMessageId,

            shopkeeper: {
                id: shopkeeper.id,
                firstName: shopkeeper.firstName,
                lastName: shopkeeper.lastName,
                email: shopkeeper.email,
                phoneNumber: shopkeeper.phoneNumber,
                role: shopkeeper.role,
                ownerId: shopkeeper.ownerId,
                createdAt: shopkeeper.createdAt
            }
        });

    } catch (error) {

        console.error(
            "❌ Shopkeeper creation error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to create shopkeeper"
        });
    }
});

// =====================================================
// GET SHOPKEEPERS BY OWNER
// GET /users/shopkeepers/:ownerId
// =====================================================

router.get("/shopkeepers/:ownerId", async (req, res) => {
    try {
        const { ownerId } = req.params;

        const shopkeepers = await User.findAll({
            where: {
                role: "shopkeeper",
                ownerId
            },

            attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "role",
                "ownerId",
                "createdAt"
            ],

            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            shopkeepers
        });

    } catch (error) {

        console.error(
            "❌ Fetch shopkeepers error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to fetch shopkeepers"
        });
    }
});

// =====================================================
// GET USER BY ID
// GET /users/:id
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "role",
                "ownerId",
                "createdAt"
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.error(
            "❌ Fetch user error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to fetch user"
        });
    }
});

// =====================================================
// SEND PASSWORD RESET OTP
// POST /users/send-otp
// =====================================================

router.post("/send-otp", async (req, res) => {
    try {
        const email = cleanEmail(req.body.email);
        const otp = cleanString(req.body.otp);

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "Email and OTP are required"
            });
        }

        // -----------------------------
        // Find user
        // -----------------------------

        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error:
                    "No account found with this email address"
            });
        }

        // -----------------------------
        // Send OTP
        // -----------------------------

        const emailResult =
            await EmailService.sendOTPEmail(
                email,
                otp,
                user.firstName
            );

        if (
            !emailResult ||
            emailResult.success !== true
        ) {
            return res.status(500).json({
                success: false,
                error:
                    emailResult?.error ||
                    "Failed to send OTP email"
            });
        }

        console.log(
            `✅ OTP email sent to ${email}`
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.error(
            "❌ Send OTP error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to send OTP"
        });
    }
});

// =====================================================
// RESET PASSWORD
// POST /users/reset-password
// =====================================================

router.post("/reset-password", async (req, res) => {
    try {
        const email = cleanEmail(req.body.email);
        const newPassword = cleanString(
            req.body.newPassword
        );

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                error:
                    "Email and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error:
                    "Password must be at least 6 characters"
            });
        }

        // -----------------------------
        // Find user
        // -----------------------------

        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // -----------------------------
        // Hash password
        // -----------------------------

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        // -----------------------------
        // Update password
        // -----------------------------

        await user.update({
            password: hashedPassword
        });

        // -----------------------------
        // Send confirmation email
        // -----------------------------

        let emailSent = false;
        let emailError = null;

        try {
            const emailResult =
                await EmailService.sendPasswordResetConfirmation(
                    email,
                    user.firstName
                );

            if (
                emailResult &&
                emailResult.success === true
            ) {
                emailSent = true;
            } else {
                emailError =
                    emailResult?.error ||
                    "Password confirmation email failed";
            }

        } catch (emailErrorObject) {

            emailError =
                emailErrorObject.message ||
                "Unknown email error";

            console.error(
                "❌ Password confirmation email failed:",
                emailErrorObject
            );
        }

        // -----------------------------
        // Response
        // -----------------------------

        return res.status(200).json({
            success: true,

            message:
                "Password reset successfully",

            emailSent,

            emailError: emailSent
                ? null
                : emailError
        });

    } catch (error) {

        console.error(
            "❌ Reset password error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to reset password"
        });
    }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;