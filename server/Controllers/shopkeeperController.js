const { Users } = require('../models');
const bcrypt = require('bcrypt');
const emailService = require('../Services/emailService');

// ================= CREATE SHOPKEEPER =================
const createShopkeeper = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists = await Users.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    // 🔐 Generate random password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(plainPassword, 10);

    const shopkeeper = await Users.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hash,
      role: "shopkeeper",
      ownerId: req.user.id
    });

    // 📧 Send email with credentials
    const emailResult = await emailService.sendShopkeeperCredentials(
      shopkeeper,
      plainPassword,
      req.user.firstName // Owner name
    );

    res.status(201).json({
      message: "Shopkeeper created successfully",
      emailSent: emailResult.success
    });

  } catch (err) {
    console.error("Create shopkeeper error:", err);
    res.status(500).json({ error: "Failed to create shopkeeper" });
  }
};

// ================= GET ALL SHOPKEEPERS =================
const getShopkeepers = async (req, res) => {
  try {
    const shopkeepers = await Users.findAll({
      where: { ownerId: req.user.id, role: "shopkeeper" },
      attributes: { exclude: ['password'] }
    });
    res.json(shopkeepers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shopkeepers" });
  }
};

// ================= GET SINGLE SHOPKEEPER =================
const getShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Users.findOne({
      where: { id: req.params.id, ownerId: req.user.id, role: "shopkeeper" },
      attributes: { exclude: ['password'] }
    });

    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });

    res.json(shopkeeper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shopkeeper" });
  }
};

// ================= UPDATE SHOPKEEPER =================
const updateShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Users.findOne({
      where: { id: req.params.id, ownerId: req.user.id, role: "shopkeeper" }
    });

    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });

    const { firstName, lastName, phoneNumber } = req.body;
    await shopkeeper.update({ firstName, lastName, phoneNumber });

    res.json({ message: "Shopkeeper updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update shopkeeper" });
  }
};

// ================= DELETE SHOPKEEPER =================
const deleteShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await Users.findOne({
      where: { id: req.params.id, ownerId: req.user.id, role: "shopkeeper" }
    });

    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });

    await shopkeeper.destroy();
    res.json({ message: "Shopkeeper deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete shopkeeper" });
  }
};

// ================= RESET SHOPKEEPER PASSWORD =================
const resetShopkeeperPassword = async (req, res) => {
  try {
    const { id } = req.body;

    const shopkeeper = await Users.findOne({
      where: { id, ownerId: req.user.id, role: "shopkeeper" }
    });

    if (!shopkeeper) return res.status(404).json({ error: "Shopkeeper not found" });

    const newPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(newPassword, 10);

    await shopkeeper.update({ password: hash });

    await emailService.sendPasswordReset(shopkeeper.email, newPassword);

    res.json({ message: "Password reset and email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

module.exports = {
  createShopkeeper,
  getShopkeepers,
  getShopkeeper,
  updateShopkeeper,
  deleteShopkeeper,
  resetShopkeeperPassword
};
