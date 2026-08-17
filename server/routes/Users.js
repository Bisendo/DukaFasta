// =====================================================
// DukaFasta - Users Routes
// =====================================================

"use strict";

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv");

// =====================================================
// LOAD ENVIRONMENT
// =====================================================

const envPath =
    path.join(__dirname, "../.env");

const envResult =
    dotenv.config({
        path: envPath,
        override: true
    });

if (envResult.error) {
    console.warn(
        "⚠️ Users route could not load .env:",
        envResult.error.message
    );
} else {
    console.log(
        `✅ Users route loaded .env from: ${envPath}`
    );
}

// =====================================================
// DATABASE
// =====================================================

const { User } =
    require("../models");

// =====================================================
// EMAIL SERVICE
// =====================================================

let EmailService;

try {
    EmailService =
        require("../Services/emailService");

    console.log(
        "✅ EmailService loaded successfully"
    );

} catch (error) {
    console.error(
        "❌ Failed to load EmailService:",
        error.message
    );

    EmailService = null;
}

// =====================================================
// JWT
// =====================================================

const JWT_SECRET =
    process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn(
        "⚠️ JWT_SECRET is missing from .env"
    );
}

// =====================================================
// HELPERS
// =====================================================

function cleanString(value) {
    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();
}

function cleanEmail(email) {
    return cleanString(email)
        .toLowerCase();
}

// =====================================================
// EMAIL SERVICE CHECK
// =====================================================

function isEmailServiceAvailable() {
    return (
        EmailService &&
        typeof EmailService
            .sendShopkeeperCredentials ===
            "function"
    );
}

// =====================================================
// EMAIL STATUS
// GET /users/email-status
// =====================================================

router.get(
    "/email-status",
    async (req, res) => {
        try {

            if (!EmailService) {
                return res.status(500).json({
                    success: false,

                    emailService: {
                        loaded: false,

                        status: {
                            configured: false,

                            errors: [
                                "Email service could not be loaded."
                            ]
                        }
                    }
                });
            }

            const status =
                typeof EmailService.getStatus ===
                "function"
                    ? EmailService.getStatus()
                    : {
                        configured: false,

                        errors: [
                            "getStatus() is unavailable."
                        ]
                    };

            const connection =
                typeof EmailService.verifyConnection ===
                "function"
                    ? await EmailService.verifyConnection()
                    : {
                        success: false,

                        error:
                            "verifyConnection() is unavailable."
                    };

            const configuration =
                typeof EmailService.getConfiguration ===
                "function"
                    ? EmailService.getConfiguration()
                    : null;

            return res.status(200).json({
                success: true,

                emailService: {
                    loaded: true,

                    status,

                    connection,

                    configuration
                }
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
);

// =====================================================
// TEST EMAIL
// POST /users/test-email
// =====================================================

router.post(
    "/test-email",
    async (req, res) => {
        try {

            const email =
                cleanEmail(
                    req.body.email
                );

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Email is required."
                });
            }

            if (!EmailService) {
                return res.status(500).json({
                    success: false,
                    error:
                        "Email service is not available."
                });
            }

            console.log(
                `📧 Sending test email to: ${email}`
            );

            if (
                typeof EmailService.testEmailConfiguration !==
                "function"
            ) {
                return res.status(500).json({
                    success: false,
                    error:
                        "Email test function is not available."
                });
            }

            const result =
                await EmailService.testEmailConfiguration(
                    email
                );

            if (
                result &&
                result.success === true
            ) {
                return res.status(200).json({
                    success: true,

                    message:
                        "Test email sent successfully.",

                    emailSent: true,

                    emailMessageId:
                        result.messageId || null
                });
            }

            return res.status(500).json({
                success: false,

                message:
                    "Failed to send test email.",

                emailSent: false,

                error:
                    result?.error ||
                    "Email sending failed."
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
);

// =====================================================
// LOGIN
// POST /users/login
// =====================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const email =
                cleanEmail(
                    req.body.email
                );

            const password =
                cleanString(
                    req.body.password
                );

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Email and password are required."
                });
            }

            const user =
                await User.findOne({
                    where: {
                        email
                    }
                });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error:
                        "User not found."
                });
            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    error:
                        "Invalid email or password."
                });
            }

            if (!JWT_SECRET) {
                return res.status(500).json({
                    success: false,
                    error:
                        "JWT_SECRET is not configured."
                });
            }

            const token =
                jwt.sign(
                    {
                        id: user.id,
                        role: user.role,
                        email: user.email,
                        firstName:
                            user.firstName
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "7d"
                    }
                );

            return res.status(200).json({
                success: true,

                message:
                    "Login successful.",

                token,

                user: {
                    id: user.id,
                    role: user.role,
                    email: user.email,
                    firstName:
                        user.firstName,
                    lastName:
                        user.lastName,
                    phoneNumber:
                        user.phoneNumber,
                    ownerId:
                        user.ownerId
                }
            });

        } catch (error) {

            console.error(
                "❌ Login error:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    "Internal server error."
            });
        }
    }
);

// =====================================================
// CREATE OWNER
// POST /users/owner
// =====================================================

router.post(
    "/owner",
    async (req, res) => {

        try {

            const firstName =
                cleanString(
                    req.body.firstName
                );

            const lastName =
                cleanString(
                    req.body.lastName
                );

            const email =
                cleanEmail(
                    req.body.email
                );

            const phoneNumber =
                cleanString(
                    req.body.phoneNumber
                );

            const password =
                cleanString(
                    req.body.password
                );

            if (
                !firstName ||
                !lastName ||
                !email ||
                !phoneNumber ||
                !password
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "All fields are required."
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Password must be at least 6 characters."
                });
            }

            const existingUser =
                await User.findOne({
                    where: {
                        email
                    }
                });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error:
                        "Email already exists."
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const owner =
                await User.create({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password:
                        hashedPassword,
                    role: "owner"
                });

            console.log(
                `✅ Owner created: ${owner.email}`
            );

            // -----------------------------------------
            // SEND WELCOME EMAIL
            // -----------------------------------------

            if (
                EmailService &&
                typeof EmailService
                    .sendWelcomeEmail ===
                    "function"
            ) {

                setImmediate(
                    async () => {

                        try {

                            const result =
                                await EmailService
                                    .sendWelcomeEmail(
                                        owner
                                    );

                            if (
                                result.success
                            ) {

                                console.log(
                                    `✅ Welcome email sent to ${owner.email}`
                                );

                            } else {

                                console.error(
                                    `❌ Welcome email failed for ${owner.email}:`,
                                    result.error
                                );
                            }

                        } catch (error) {

                            console.error(
                                "❌ Background owner email error:",
                                error.message
                            );
                        }
                    }
                );
            }

            return res.status(201).json({

                success: true,

                message:
                    "Owner created successfully. Welcome email is being sent.",

                emailSent:
                    "processing",

                owner: {
                    id:
                        owner.id,

                    firstName:
                        owner.firstName,

                    lastName:
                        owner.lastName,

                    email:
                        owner.email,

                    phoneNumber:
                        owner.phoneNumber,

                    role:
                        owner.role,

                    createdAt:
                        owner.createdAt
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
                    "Failed to create owner."
            });
        }
    }
);

// =====================================================
// CREATE SHOPKEEPER
// POST /users/shopkeeper/:ownerId
// =====================================================

router.post(
    "/shopkeeper/:ownerId",
    async (req, res) => {

        try {

            console.log("");
            console.log("========================================");
            console.log(
                "🚀 SHOPKEEPER CREATION STARTED"
            );
            console.log("========================================");

            // -----------------------------------------
            // INPUT
            // -----------------------------------------

            const firstName =
                cleanString(
                    req.body.firstName
                );

            const lastName =
                cleanString(
                    req.body.lastName
                );

            const email =
                cleanEmail(
                    req.body.email
                );

            const phoneNumber =
                cleanString(
                    req.body.phoneNumber
                );

            const password =
                cleanString(
                    req.body.password
                );

            const ownerId =
                cleanString(
                    req.params.ownerId
                );

            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !firstName ||
                !lastName ||
                !email ||
                !phoneNumber ||
                !password ||
                !ownerId
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "All fields are required."
                });
            }

            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Password must be at least 6 characters."
                });
            }

            // -----------------------------------------
            // FIND OWNER
            // -----------------------------------------

            const owner =
                await User.findByPk(
                    ownerId
                );

            if (!owner) {

                return res.status(404).json({
                    success: false,
                    error:
                        "Owner not found."
                });
            }

            if (owner.role !== "owner") {

                return res.status(400).json({
                    success: false,
                    error:
                        "Selected user is not an owner."
                });
            }

            // -----------------------------------------
            // DUPLICATE EMAIL
            // -----------------------------------------

            const existingUser =
                await User.findOne({
                    where: {
                        email
                    }
                });

            if (existingUser) {

                return res.status(409).json({
                    success: false,
                    error:
                        "Email already exists."
                });
            }

            // -----------------------------------------
            // HASH PASSWORD
            // -----------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            // -----------------------------------------
            // CREATE SHOPKEEPER
            // -----------------------------------------

            const shopkeeper =
                await User.create({

                    firstName,

                    lastName,

                    email,

                    phoneNumber,

                    password:
                        hashedPassword,

                    role:
                        "shopkeeper",

                    ownerId:
                        owner.id
                });

            console.log("");
            console.log(
                "✅ SHOPKEEPER CREATED IN DATABASE"
            );

            console.log(
                "ID:",
                shopkeeper.id
            );

            console.log(
                "Email:",
                shopkeeper.email
            );

            // -----------------------------------------
            // EMAIL DATA
            // -----------------------------------------

            const shopkeeperEmailData = {

                id:
                    shopkeeper.id,

                firstName:
                    shopkeeper.firstName,

                lastName:
                    shopkeeper.lastName,

                email:
                    shopkeeper.email,

                phoneNumber:
                    shopkeeper.phoneNumber,

                role:
                    shopkeeper.role
            };

            const ownerName =
                `${owner.firstName || ""} ${owner.lastName || ""}`
                    .trim() ||
                "DukaFasta Administrator";

            // -----------------------------------------
            // SEND EMAIL
            // -----------------------------------------

            console.log("");
            console.log(
                "📧 Sending shopkeeper credentials..."
            );

            if (
                !isEmailServiceAvailable()
            ) {

                console.error(
                    "❌ EmailService is unavailable."
                );

                return res.status(201).json({

                    success: true,

                    message:
                        "Shopkeeper created successfully, but the email service is unavailable.",

                    emailSent:
                        false,

                    emailError:
                        "Email service is not available.",

                    emailMessageId:
                        null,

                    shopkeeper: {
                        id:
                            shopkeeper.id,

                        firstName:
                            shopkeeper.firstName,

                        lastName:
                            shopkeeper.lastName,

                        email:
                            shopkeeper.email,

                        phoneNumber:
                            shopkeeper.phoneNumber,

                        role:
                            shopkeeper.role,

                        ownerId:
                            shopkeeper.ownerId,

                        createdAt:
                            shopkeeper.createdAt
                    }
                });
            }

            let emailResult;

            try {

                emailResult =
                    await EmailService
                        .sendShopkeeperCredentials(
                            shopkeeperEmailData,
                            password,
                            ownerName
                        );

            } catch (emailError) {

                console.error(
                    "❌ Email exception:",
                    emailError.message
                );

                emailResult = {
                    success: false,

                    error:
                        emailError.message
                };
            }

            console.log(
                "📧 Email result:",
                emailResult
            );

            // -----------------------------------------
            // EMAIL SUCCESS
            // -----------------------------------------

            if (
                emailResult &&
                emailResult.success === true
            ) {

                console.log("");
                console.log("========================================");
                console.log(
                    "🎉 SHOPKEEPER CREATED + EMAIL SENT"
                );
                console.log("========================================");

                return res.status(201).json({

                    success: true,

                    message:
                        "Shopkeeper created successfully and login credentials were sent by email.",

                    emailSent:
                        true,

                    emailError:
                        null,

                    emailMessageId:
                        emailResult.messageId ||
                        null,

                    shopkeeper: {

                        id:
                            shopkeeper.id,

                        firstName:
                            shopkeeper.firstName,

                        lastName:
                            shopkeeper.lastName,

                        email:
                            shopkeeper.email,

                        phoneNumber:
                            shopkeeper.phoneNumber,

                        role:
                            shopkeeper.role,

                        ownerId:
                            shopkeeper.ownerId,

                        createdAt:
                            shopkeeper.createdAt
                    }
                });
            }

            // -----------------------------------------
            // EMAIL FAILED
            // -----------------------------------------

            const emailError =
                emailResult?.error ||
                "Email sending failed.";

            console.error("");
            console.error("========================================");
            console.error(
                "⚠️ SHOPKEEPER CREATED BUT EMAIL FAILED"
            );
            console.error("========================================");

            console.error(
                "Shopkeeper:",
                shopkeeper.email
            );

            console.error(
                "Email error:",
                emailError
            );

            console.error("========================================");

            return res.status(201).json({

                success: true,

                message:
                    "Shopkeeper created successfully, but the email could not be sent.",

                emailSent:
                    false,

                emailError,

                emailMessageId:
                    null,

                shopkeeper: {

                    id:
                        shopkeeper.id,

                    firstName:
                        shopkeeper.firstName,

                    lastName:
                        shopkeeper.lastName,

                    email:
                        shopkeeper.email,

                    phoneNumber:
                        shopkeeper.phoneNumber,

                    role:
                        shopkeeper.role,

                    ownerId:
                        shopkeeper.ownerId,

                    createdAt:
                        shopkeeper.createdAt
                }
            });

        } catch (error) {

            console.error("");
            console.error("========================================");
            console.error(
                "❌ SHOPKEEPER CREATION ERROR"
            );
            console.error("========================================");

            console.error(
                error
            );

            console.error("========================================");

            return res.status(500).json({
                success: false,
                error:
                    error.message ||
                    "Failed to create shopkeeper."
            });
        }
    }
);

// =====================================================
// GET SHOPKEEPERS
// GET /users/shopkeepers/:ownerId
// =====================================================

router.get(
    "/shopkeepers/:ownerId",
    async (req, res) => {

        try {

            const ownerId =
                cleanString(
                    req.params.ownerId
                );

            const shopkeepers =
                await User.findAll({

                    where: {
                        role:
                            "shopkeeper",

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
                        [
                            "createdAt",
                            "DESC"
                        ]
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
                error:
                    "Failed to fetch shopkeepers."
            });
        }
    }
);

// =====================================================
// GET USER
// GET /users/:id
// =====================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const id =
                cleanString(
                    req.params.id
                );

            const user =
                await User.findByPk(
                    id,
                    {
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
                    }
                );

            if (!user) {

                return res.status(404).json({
                    success: false,
                    error:
                        "User not found."
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
                error:
                    "Failed to fetch user."
            });
        }
    }
);

// =====================================================
// SEND OTP
// POST /users/send-otp
// =====================================================

router.post(
    "/send-otp",
    async (req, res) => {

        try {

            const email =
                cleanEmail(
                    req.body.email
                );

            const otp =
                cleanString(
                    req.body.otp
                );

            if (!email || !otp) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Email and OTP are required."
                });
            }

            if (
                !EmailService ||
                typeof EmailService.sendOTPEmail !==
                "function"
            ) {

                return res.status(500).json({
                    success: false,
                    error:
                        "Email service is unavailable."
                });
            }

            const user =
                await User.findOne({
                    where: {
                        email
                    }
                });

            if (!user) {

                return res.status(404).json({
                    success: false,
                    error:
                        "No account found with this email address."
                });
            }

            console.log(
                `📧 Sending OTP to ${email}...`
            );

            const result =
                await EmailService.sendOTPEmail(
                    email,
                    otp,
                    user.firstName
                );

            if (
                !result ||
                result.success !== true
            ) {

                return res.status(500).json({

                    success: false,

                    error:
                        result?.error ||
                        "Failed to send OTP.",

                    emailSent:
                        false,

                    emailMessageId:
                        null
                });
            }

            return res.status(200).json({

                success: true,

                message:
                    "OTP sent successfully.",

                emailSent:
                    true,

                emailMessageId:
                    result.messageId ||
                    null
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
                    "Failed to send OTP.",

                emailSent:
                    false
            });
        }
    }
);

// =====================================================
// RESET PASSWORD
// POST /users/reset-password
// =====================================================

router.post(
    "/reset-password",
    async (req, res) => {

        try {

            const email =
                cleanEmail(
                    req.body.email
                );

            const newPassword =
                cleanString(
                    req.body.newPassword
                );

            if (
                !email ||
                !newPassword
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Email and new password are required."
                });
            }

            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Password must be at least 6 characters."
                });
            }

            const user =
                await User.findOne({
                    where: {
                        email
                    }
                });

            if (!user) {

                return res.status(404).json({
                    success: false,
                    error:
                        "User not found."
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            await user.update({
                password:
                    hashedPassword
            });

            // -----------------------------------------
            // SEND CONFIRMATION EMAIL
            // -----------------------------------------

            if (
                EmailService &&
                typeof EmailService
                    .sendPasswordResetConfirmation ===
                    "function"
            ) {

                setImmediate(
                    async () => {

                        try {

                            const result =
                                await EmailService
                                    .sendPasswordResetConfirmation(
                                        email,
                                        user.firstName
                                    );

                            if (
                                result.success
                            ) {

                                console.log(
                                    `✅ Password confirmation email sent to ${email}`
                                );

                            } else {

                                console.error(
                                    `❌ Password confirmation email failed for ${email}:`,
                                    result.error
                                );
                            }

                        } catch (error) {

                            console.error(
                                "❌ Background password email error:",
                                error.message
                            );
                        }
                    }
                );
            }

            return res.status(200).json({

                success: true,

                message:
                    "Password reset successfully. Confirmation email is being sent.",

                emailSent:
                    "processing"
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
                    "Failed to reset password."
            });
        }
    }
);

// =====================================================
// EXPORT
// =====================================================

module.exports =
    router;