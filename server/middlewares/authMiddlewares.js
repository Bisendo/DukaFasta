const { verify } = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // ⚡ must match auth.js

const validateToken = (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Check Authorization header (Bearer)
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ Check query param
    if (!token && req.query.token) token = req.query.token;

    // 3️⃣ Check cookies
    if (!token && req.cookies && req.cookies.accessToken) token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required", message: "No access token provided" });
    }

    const decoded = verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, error: "Invalid token", message: "Token is invalid" });
    }

    // Standardize user object
    req.user = {
      id: decoded.id,
      role: decoded.role, // now always called 'role'
      email: decoded.email || null,
      firstName: decoded.firstName || null,
      lastName: decoded.lastName || null,
      businessOwnerId: decoded.businessOwnerId || null,
      createdBy: decoded.createdBy || null,
      ...decoded
    };

    req.token = token;

    next();
  } catch (err) {
    console.error("Token validation error:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: "Token expired", message: "Please login again" });
    }
    return res.status(401).json({ success: false, error: "Authentication failed", message: err.message });
  }
};

// Optional: check roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: "Role required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Access denied", message: `Allowed: ${allowedRoles.join(", ")}` });
    }
    next();
  };
};

module.exports = {
  validateToken,
  requireRole
};
