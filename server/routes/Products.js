const express = require("express");
const router = express.Router();
const { Product } = require("../models"); // use exact model name

// ================= CREATE PRODUCT =================
router.post("/:ownerId", async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      ownerId: req.params.ownerId
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// ================= GET OWNER PRODUCTS =================
router.get("/:ownerId", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { ownerId: req.params.ownerId }
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ================= GET ALL PRODUCTS =================
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ================= GET PRODUCT BY ID =================
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ================= UPDATE PRODUCT =================
router.put("/product/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ================= DELETE PRODUCT =================
router.delete("/product/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
