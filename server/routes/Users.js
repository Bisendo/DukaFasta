const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");

// Create Owner
router.post("/owner", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Check if email exists
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

    res.status(201).json({ message: "Owner created", owner });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create Shopkeeper
router.post("/shopkeeper/:ownerId", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const shopkeeper = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "shopkeeper",
      ownerId: req.params.ownerId
    });

    res.status(201).json({ message: "Shopkeeper created", shopkeeper });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Get all shopkeepers created by a specific owner
router.get("/shopkeepers/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Find all users with role "shopkeeper" and this ownerId
    const shopkeepers = await User.findAll({
      where: {
        role: "shopkeeper",
        ownerId: ownerId
      },
      attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "role", "ownerId"] // send only needed fields
    });

    res.status(200).json(shopkeepers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
