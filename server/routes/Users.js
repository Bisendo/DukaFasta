// =====================================================
// DukaFasta - Users Routes
// =====================================================

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
    console.warn("⚠️ JWT_SECRET is not configured.");
}

// =====================================================
// HELPERS
// =====================================================

function cleanString(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

function cleanEmail(email) {
    return cleanString(email).toLowerCase();
}

// =====================================================
// LOGIN
// POST /users/login
// =====================================================

router.post("/login", async (req, res) => {
    try {
        const email = cleanEmail(req.body.email);
        const password = cleanString(req.body.password);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

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

        if (!JWT_SECRET) {
            return res.status(500).json({
                success: false,
                error: "JWT_SECRET is not configured"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email,
                firstName: user.firstName
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

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
// CREATE OWNER
// POST /users/owner
// =====================================================

router.post("/owner", async (req, res) => {
    try {
        const firstName = cleanString(req.body.firstName);
        const lastName = cleanString(req.body.lastName);
        const email = cleanEmail(req.body.email);
        const phoneNumber = cleanString(req.body.phoneNumber);
        const password = cleanString(req.body.password);

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

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const owner = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: "owner"
        });

        console.log(
            `✅ Owner created successfully: ${owner.email}`
        );

        // =================================================
        // WELCOME EMAIL
        // =================================================
        //
        // Owner creation does NOT wait for email.
        // This keeps owner creation fast.
        //
        // =================================================

        setImmediate(async () => {
            try {
                const result =
                    await EmailService.sendWelcomeEmail(
                        owner
                    );

                if (result.success) {
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
        });

        return res.status(201).json({
            success: true,
            message:
                "Owner created successfully. Welcome email is being sent.",
            emailSent: "processing",
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
//
// IMPORTANT:
//
// 1. Shopkeeper is created in MySQL first.
// 2. Email is then sent.
// 3. We WAIT for Gmail.
// 4. Response tells frontend exactly:
//
//    emailSent: true
//
//    OR
//
//    emailSent: false
//
// No "processing" response.
//
// =====================================================

router.post(
    "/shopkeeper/:ownerId",
    async (req, res) => {

        try {

            console.log("");
            console.log(
                "========================================"
            );
            console.log(
                "🚀 SHOPKEEPER CREATION STARTED"
            );
            console.log(
                "========================================"
            );

            // =================================================
            // READ INPUT
            // =================================================

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

            // =================================================
            // VALIDATION
            // =================================================

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
                    error: "All fields are required"
                });

            }

            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Password must be at least 6 characters"
                });

            }

            // =================================================
            // FIND OWNER
            // =================================================

            const owner =
                await User.findByPk(
                    ownerId
                );

            if (!owner) {

                return res.status(404).json({
                    success: false,
                    error: "Owner not found"
                });

            }

            if (
                owner.role !== "owner"
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Selected user is not an owner"
                });

            }

            // =================================================
            // CHECK DUPLICATE EMAIL
            // =================================================

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
                        "Email already exists"
                });

            }

            // =================================================
            // HASH PASSWORD
            // =================================================

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            // =================================================
            // CREATE SHOPKEEPER
            // =================================================

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

            // =================================================
            // PREPARE EMAIL DATA
            // =================================================

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
                `${owner.firstName || ""} ${
                    owner.lastName || ""
                }`.trim() ||
                "DukaFasta Administrator";

            // =================================================
            // SEND EMAIL
            // =================================================

            console.log("");
            console.log(
                "📧 Sending shopkeeper credentials..."
            );

            const emailResult =
                await EmailService
                    .sendShopkeeperCredentials(
                        shopkeeperEmailData,
                        password,
                        ownerName
                    );

            // =================================================
            // EMAIL SUCCESS
            // =================================================

            if (
                emailResult &&
                emailResult.success === true
            ) {

                console.log("");
                console.log(
                    "========================================"
                );
                console.log(
                    "🎉 SHOPKEEPER CREATED + EMAIL SENT"
                );
                console.log(
                    "========================================"
                );
                console.log(
                    "Shopkeeper:",
                    shopkeeper.email
                );
                console.log(
                    "Message ID:",
                    emailResult.messageId
                );
                console.log(
                    "========================================"
                );

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

            // =================================================
            // EMAIL FAILED
            // =================================================

            console.error("");
            console.error(
                "========================================"
            );
            console.error(
                "⚠️ SHOPKEEPER CREATED BUT EMAIL FAILED"
            );
            console.error(
                "========================================"
            );
            console.error(
                "Shopkeeper:",
                shopkeeper.email
            );
            console.error(
                "Email error:",
                emailResult?.error
            );
            console.error(
                "========================================"
            );

            // -------------------------------------------------
            // IMPORTANT:
            //
            // Do NOT delete the shopkeeper.
            //
            // The account has already been successfully created.
            // -------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Shopkeeper created successfully, but the email could not be sent.",

                emailSent:
                    false,

                emailError:
                    emailResult?.error ||
                    "Email sending failed",

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
            console.error(
                "========================================"
            );
            console.error(
                "❌ SHOPKEEPER CREATION ERROR"
            );
            console.error(
                "========================================"
            );
            console.error(error);
            console.error(
                "========================================"
            );

            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Failed to create shopkeeper"

            });

        }

    }
);

// =====================================================
// GET SHOPKEEPERS BY OWNER
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
                    "Failed to fetch shopkeepers"

            });

        }

    }
);

// =====================================================
// GET USER BY ID
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
                        "User not found"

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
                    "Failed to fetch user"

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
                        "Email and OTP are required"

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
                        "No account found with this email address"

                });

            }

            console.log(
                `📧 Sending OTP to ${email}...`
            );

            const result =
                await EmailService
                    .sendOTPEmail(
                        email,
                        otp,
                        user.firstName
                    );

            if (
                !result ||
                result.success !== true
            ) {

                console.error(
                    "❌ OTP email failed:",
                    result?.error
                );

                return res.status(500).json({

                    success: false,

                    error:
                        result?.error ||
                        "Failed to send OTP",

                    emailSent:
                        false,

                    emailMessageId:
                        null

                });

            }

            return res.status(200).json({

                success: true,

                message:
                    "OTP sent successfully",

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
                    "Failed to send OTP",

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
                        "Email and new password are required"

                });

            }

            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Password must be at least 6 characters"

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
                        "User not found"

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

            // =================================================
            // SEND PASSWORD CONFIRMATION IN BACKGROUND
            // =================================================

            setImmediate(async () => {

                try {

                    const result =
                        await EmailService
                            .sendPasswordResetConfirmation(
                                email,
                                user.firstName
                            );

                    if (result.success) {

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

            });

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
                    "Failed to reset password"

            });

        }

    }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;