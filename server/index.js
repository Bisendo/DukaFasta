const express = require("express");
const app = express();
const db = require("./models");
const cors = require("cors");
const path = require("path");

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================

// Auth Routes
const userRouter = require("./routes/Users");
app.use("/auth", userRouter);

// Product Routes
const productRouter = require("./routes/Products");
app.use("/products", productRouter);


// Sales Routes
const salesRouter = require("./routes/Sales");
app.use("/sales", salesRouter);



// Email Routes
const emailRoutes = require("./routes/emailroutes");
app.use("/email", emailRoutes);

// User Routes
const userManagementRoutes = require("./routes/Users");
app.use("/users", userManagementRoutes);



// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected",
      email: "configured",
      auth: "active",
      products: "active",
      shopkeepers: "active"
    }
  });
});

// ================= ROOT ENDPOINT =================
app.get("/", (req, res) => {
  res.json({
    message: "Inventory Management System API",
    version: "2.0.0",
    endpoints: {
      auth: "/auth",
      products: "/products",
      shopkeepers: "/shopkeepers",
      email: "/email",
      users: "/users",
      health: "/health"
    }
  });
});

// ================= ERROR HANDLING =================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// ================= DB + SERVER =================
db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`📊 Database synchronized`);
  });
}).catch(err => {
  console.error("❌ Database connection failed:", err);
});