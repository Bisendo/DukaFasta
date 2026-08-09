const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const EmailService = require("../Services/emailService"); // Import your email service

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================= CREATE OWNER =================
router.post("/owner", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "owner"
    });

    // Send welcome email to owner
    try {
      await EmailService.sendWelcomeEmail(owner);
      console.log(`Welcome email sent to owner: ${owner.email}`);
    } catch (emailError) {
      console.error("Failed to send welcome email to owner:", emailError);
    }

    res.status(201).json({ 
      message: "Owner created successfully", 
      owner: {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phoneNumber: owner.phoneNumber,
        role: owner.role
      }
    });

  } catch (err) {
    console.error("Owner creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= CREATE SHOPKEEPER =================
router.post("/shopkeeper/:ownerId", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    const { ownerId } = req.params;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const owner = await User.findByPk(ownerId);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const shopkeeper = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "shopkeeper",
      ownerId
    });

    const shopkeeperData = {
      firstName: shopkeeper.firstName,
      lastName: shopkeeper.lastName,
      email: shopkeeper.email,
      phoneNumber: shopkeeper.phoneNumber,
      role: shopkeeper.role
    };

    // Send credentials email to shopkeeper
    let emailSent = false;
    try {
      const emailResult = await EmailService.sendShopkeeperCredentials(
        shopkeeperData, 
        password,
        `${owner.firstName} ${owner.lastName}`
      );
      
      if (emailResult.success) {
        emailSent = true;
        console.log(`Credentials email sent to shopkeeper: ${shopkeeper.email}`);
      }
    } catch (emailError) {
      console.error("Error sending credentials email:", emailError);
    }

    res.status(201).json({ 
      message: emailSent 
        ? "Shopkeeper created successfully! Login credentials have been sent to their email."
        : "Shopkeeper created successfully! (Note: Email notification could not be sent)",
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

  } catch (err) {
    console.error("Shopkeeper creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET SHOPKEEPERS BY OWNER =================
router.get("/shopkeepers/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const shopkeepers = await User.findAll({
      where: { role: "shopkeeper", ownerId },
      attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "role", "ownerId", "createdAt"],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(shopkeepers);

  } catch (err) {
    console.error("Fetch shopkeepers error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET OWNER BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "role", "ownerId"]
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);

  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= FORGOT PASSWORD - SEND OTP =================
router.post("/send-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "No account found with this email address" 
      });
    }

    // Store OTP in database with expiration (optional)
    // You can add an otp field to your User model or create a separate table
    // For now, we'll just send the email
    
    // Send OTP via email
    const emailResult = await EmailService.sendOTPEmail(email, otp, user.firstName);
    
    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: "OTP sent successfully" 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: "Failed to send OTP email" 
      });
    }

  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await user.update({ password: hashedPassword });

    // Send confirmation email
    try {
      await EmailService.sendPasswordResetConfirmation(email, user.firstName);
    } catch (emailError) {
      console.error("Failed to send password reset confirmation:", emailError);
    }

    res.json({ 
      success: true, 
      message: "Password reset successfully" 
    });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;