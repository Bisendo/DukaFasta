// =====================================================
// DukaFasta - Users Routes (FIXED)
// =====================================================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// =====================================================
// LOAD ENVIRONMENT VARIABLES FIRST
// =====================================================
const dotenv = require("dotenv");

// Load .env from the correct location
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded .env from: ${envPath}`);
} else {
    dotenv.config();
    console.log("⚠️ Using default .env location");
}

const { User } = require("../models");

// =====================================================
// FIX: Import Email Service with correct path
// =====================================================
// Try multiple possible paths
let EmailService = null;
const possiblePaths = [
    path.join(__dirname, "../services/emailService"),
    path.join(__dirname, "../Services/emailService"),
    path.join(__dirname, "./services/emailService"),
    path.join(__dirname, "./emailService"),
];

for (const servicePath of possiblePaths) {
    try {
        if (fs.existsSync(servicePath + ".js")) {
            EmailService = require(servicePath);
            console.log(`✅ Loaded EmailService from: ${servicePath}.js`);
            break;
        }
    } catch (e) {
        // Try next path
    }
}

if (!EmailService) {
    console.error("❌ Failed to load EmailService!");
    // Create a fallback EmailService that logs errors
    EmailService = {
        sendShopkeeperCredentials: async (shopkeeper, password, ownerName) => {
            console.error("❌ EmailService not loaded properly!");
            console.error("Shopkeeper:", shopkeeper?.email);
            console.error("Password:", password);
            console.error("Owner:", ownerName);
            return {
                success: false,
                error: "Email service not configured properly"
            };
        },
        sendWelcomeEmail: async (user) => {
            console.error("❌ EmailService not loaded properly!");
            return {
                success: false,
                error: "Email service not configured properly"
            };
        },
        sendOTPEmail: async (email, otp, firstName) => {
            console.error("❌ EmailService not loaded properly!");
            return {
                success: false,
                error: "Email service not configured properly"
            };
        },
        sendPasswordResetConfirmation: async (email, firstName) => {
            console.error("❌ EmailService not loaded properly!");
            return {
                success: false,
                error: "Email service not configured properly"
            };
        },
        verifyConnection: async () => {
            return {
                success: false,
                error: "Email service not configured properly"
            };
        },
        getStatus: () => {
            return {
                configured: false,
                errors: ["Email service not loaded"]
            };
        }
    };
}

// =====================================================
// CONFIGURATION
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

if (!JWT_SECRET || JWT_SECRET === "your_secret_key_here") {
    console.warn("⚠️ JWT_SECRET is using default value. Please set it in .env");
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
// GET EMAIL STATUS ENDPOINT (for debugging)
// GET /users/email-status
// =====================================================

router.get("/email-status", async (req, res) => {
    try {
        const status = EmailService.getStatus ? EmailService.getStatus() : { configured: false, errors: ["Email service not loaded"] };
        const connection = await EmailService.verifyConnection();
        
        res.json({
            success: true,
            emailService: {
                loaded: !!EmailService,
                status: status,
                connection: connection,
                env: {
                    EMAIL_USER: process.env.EMAIL_USER ? "Set" : "Not set",
                    EMAIL_PASS: process.env.EMAIL_PASS ? "Set (length: " + process.env.EMAIL_PASS.length + ")" : "Not set",
                    EMAIL_HOST: process.env.EMAIL_HOST || "Not set",
                    EMAIL_PORT: process.env.EMAIL_PORT || "Not set",
                }
            }
        });
    } catch (error) {
        console.error("Email status error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =====================================================
// TEST EMAIL ENDPOINT
// POST /users/test-email
// =====================================================

router.post("/test-email", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }
        
        console.log("📧 Sending test email to:", email);
        
        if (typeof EmailService.testConfiguration === 'function') {
            const result = await EmailService.testConfiguration(email);
            res.json({
                success: result.success,
                message: result.success ? "Test email sent successfully" : "Failed to send test email",
                result: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Test email function not available"
            });
        }
    } catch (error) {
        console.error("Test email error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

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
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
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
            { expiresIn: "7d" }
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

        if (!firstName || !lastName || !email || !phoneNumber || !password) {
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
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const owner = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: "owner"
        });

        console.log(`✅ Owner created successfully: ${owner.email}`);

        // Send welcome email in background
        setImmediate(async () => {
            try {
                const result = await EmailService.sendWelcomeEmail(owner);
                if (result.success) {
                    console.log(`✅ Welcome email sent to ${owner.email}`);
                } else {
                    console.error(`❌ Welcome email failed for ${owner.email}:`, result.error);
                }
            } catch (error) {
                console.error("❌ Background owner email error:", error.message);
            }
        });

        return res.status(201).json({
            success: true,
            message: "Owner created successfully. Welcome email is being sent.",
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
        console.error("❌ Owner creation error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create owner"
        });
    }
});

// =====================================================
// CREATE SHOPKEEPER (FIXED)
// POST /users/shopkeeper/:ownerId
// =====================================================

router.post("/shopkeeper/:ownerId", async (req, res) => {
    try {
        console.log("");
        console.log("========================================");
        console.log("🚀 SHOPKEEPER CREATION STARTED");
        console.log("========================================");

        // Read input
        const firstName = cleanString(req.body.firstName);
        const lastName = cleanString(req.body.lastName);
        const email = cleanEmail(req.body.email);
        const phoneNumber = cleanString(req.body.phoneNumber);
        const password = cleanString(req.body.password);
        const ownerId = cleanString(req.params.ownerId);

        // Validation
        if (!firstName || !lastName || !email || !phoneNumber || !password || !ownerId) {
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

        // Find owner
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

        // Check duplicate email
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create shopkeeper
        const shopkeeper = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: "shopkeeper",
            ownerId: owner.id
        });

        console.log("");
        console.log("✅ SHOPKEEPER CREATED IN DATABASE");
        console.log("ID:", shopkeeper.id);
        console.log("Email:", shopkeeper.email);

        // Prepare email data
        const shopkeeperEmailData = {
            id: shopkeeper.id,
            firstName: shopkeeper.firstName,
            lastName: shopkeeper.lastName,
            email: shopkeeper.email,
            phoneNumber: shopkeeper.phoneNumber,
            role: shopkeeper.role
        };

        const ownerName = `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || "DukaFasta Administrator";

        // =================================================
        // SEND EMAIL - WITH IMPROVED ERROR HANDLING
        // =================================================
        console.log("");
        console.log("📧 Sending shopkeeper credentials...");
        console.log("Email Service loaded:", !!EmailService);
        console.log("Email Service methods:", EmailService ? Object.keys(EmailService) : "None");

        let emailResult = null;
        let emailSent = false;
        let emailError = null;

        try {
            // Check if EmailService is properly loaded
            if (!EmailService || typeof EmailService.sendShopkeeperCredentials !== 'function') {
                throw new Error("Email service is not properly loaded");
            }

            // Send email
            emailResult = await EmailService.sendShopkeeperCredentials(
                shopkeeperEmailData,
                password,
                ownerName
            );

            console.log("Email result:", emailResult);

            if (emailResult && emailResult.success === true) {
                emailSent = true;
                console.log("✅ Email sent successfully!");
            } else {
                emailError = emailResult?.error || "Email sending failed";
                console.error("❌ Email failed:", emailError);
            }

        } catch (emailErr) {
            console.error("❌ Email sending error:", emailErr);
            emailError = emailErr.message || "Email sending failed";
            emailSent = false;
        }

        // =================================================
        // RESPONSE
        // =================================================

        if (emailSent) {
            console.log("");
            console.log("========================================");
            console.log("🎉 SHOPKEEPER CREATED + EMAIL SENT");
            console.log("========================================");
            console.log("Shopkeeper:", shopkeeper.email);
            console.log("Message ID:", emailResult?.messageId || "N/A");
            console.log("========================================");

            return res.status(201).json({
                success: true,
                message: "Shopkeeper created successfully and login credentials were sent by email.",
                emailSent: true,
                emailError: null,
                emailMessageId: emailResult?.messageId || null,
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
        } else {
            console.error("");
            console.error("========================================");
            console.error("⚠️ SHOPKEEPER CREATED BUT EMAIL FAILED");
            console.error("========================================");
            console.error("Shopkeeper:", shopkeeper.email);
            console.error("Email error:", emailError);
            console.error("========================================");

            return res.status(201).json({
                success: true,
                message: "Shopkeeper created successfully, but the email could not be sent.",
                emailSent: false,
                emailError: emailError || "Email sending failed",
                emailMessageId: null,
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
        }

    } catch (error) {
        console.error("");
        console.error("========================================");
        console.error("❌ SHOPKEEPER CREATION ERROR");
        console.error("========================================");
        console.error(error);
        console.error("========================================");

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create shopkeeper"
        });
    }
});

// =====================================================
// GET SHOPKEEPERS BY OWNER
// GET /users/shopkeepers/:ownerId
// =====================================================

router.get("/shopkeepers/:ownerId", async (req, res) => {
    try {
        const ownerId = cleanString(req.params.ownerId);

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
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            shopkeepers
        });

    } catch (error) {
        console.error("❌ Fetch shopkeepers error:", error);
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
        const id = cleanString(req.params.id);

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
        console.error("❌ Fetch user error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch user"
        });
    }
});

// =====================================================
// SEND OTP
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

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "No account found with this email address"
            });
        }

        console.log(`📧 Sending OTP to ${email}...`);

        const result = await EmailService.sendOTPEmail(email, otp, user.firstName);

        if (!result || result.success !== true) {
            console.error("❌ OTP email failed:", result?.error);
            return res.status(500).json({
                success: false,
                error: result?.error || "Failed to send OTP",
                emailSent: false,
                emailMessageId: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            emailSent: true,
            emailMessageId: result.messageId || null
        });

    } catch (error) {
        console.error("❌ Send OTP error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to send OTP",
            emailSent: false
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
        const newPassword = cleanString(req.body.newPassword);

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Email and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters"
            });
        }

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        // Send password confirmation in background
        setImmediate(async () => {
            try {
                const result = await EmailService.sendPasswordResetConfirmation(email, user.firstName);
                if (result.success) {
                    console.log(`✅ Password confirmation email sent to ${email}`);
                } else {
                    console.error(`❌ Password confirmation email failed for ${email}:`, result.error);
                }
            } catch (error) {
                console.error("❌ Background password email error:", error.message);
            }
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Confirmation email is being sent.",
            emailSent: "processing"
        });

    } catch (error) {
        console.error("❌ Reset password error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to reset password"
        });
    }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;