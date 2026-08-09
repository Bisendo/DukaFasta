const express = require("express");
const router = express.Router();
const { Sale, Product } = require("../models");

// ================= CREATE SALE =================
router.post("/", async (req, res) => {
  try {
    const { productId, quantity, shopkeeperId } = req.body;

    // Find the product
    const product = await Product.findByPk(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity)
      return res.status(400).json({ message: "Not enough stock" });

    const unitBuyPrice = product.buyPrice;
    const unitSellPrice = product.sellPrice;

    const totalPrice = unitSellPrice * quantity;
    const totalCost = unitBuyPrice * quantity;
    const profit = totalPrice - totalCost;

    // Reduce stock
    await product.update({ quantity: product.quantity - quantity });

    // Create sale
    const sale = await Sale.create({
      productId,
      quantity,
      unitBuyPrice,
      unitSellPrice,
      totalPrice,
      profit,
      shopkeeperId,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================= GET SALES BY OWNER =================
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // Get all sales where the product belongs to this owner
    const sales = await Sale.findAll({
      include: [
        {
          model: Product,
          where: { ownerId }, // filter by ownerId through Product
        },
      ],
    });

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales for owner:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================= GET ALL SALES =================
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [{ model: Product }],
    });
    res.json(sales);
  } catch (error) {
    console.error("Error fetching all sales:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
