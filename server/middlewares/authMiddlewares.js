const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  try {
    // Check multiple possible token locations
    let token = null;
    
    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    
    // 2. Check custom header (for backward compatibility)
    if (!token && req.headers["accesstoken"]) {
      token = req.headers["accesstoken"];
    }
    
    // 3. Check query parameter (optional, for specific cases)
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    // 4. Check cookies (if using cookie-based auth)
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token found in any location
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "No access token provided. Please login first."
      });
    }

    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || "importantsecret");
    
    // Validate token structure
    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Token structure is invalid"
      });
    }
    
    // Check if token has required fields (optional, based on your JWT payload)
    if (!decoded.id && !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: "Invalid token payload",
        message: "Token does not contain user identification"
      });
    }

    // Standardize user data format
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email || null,
      userType: decoded.userType || decoded.role || null,
      firstName: decoded.firstName || null,
      lastName: decoded.lastName || null,
      businessOwnerId: decoded.businessOwnerId || null,
      createdBy: decoded.createdBy || null,
      // Include all other token claims
      ...decoded
    };

    // Add token to request for potential use
    req.token = token;

    // Log token verification (optional, for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Token verified for user: ${req.user.id}, type: ${req.user.userType}`);
    }

    next();
    
  } catch (err) {
    console.error("Token validation error:", err.message);
    
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "The provided token is malformed or invalid"
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Your session has expired. Please login again.",
        expiredAt: err.expiredAt
      });
    }
    
    if (err.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        error: "Token not active",
        message: "Token is not yet valid",
        date: err.date
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
      message: "An error occurred during authentication"
    });
  }
};

// Optional: Middleware to check specific user types
const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please login to access this resource"
      });
    }
    
    if (!req.user.userType) {
      return res.status(403).json({
        success: false,
        error: "User type not defined",
        message: "Your account type is not properly configured"
      });
    }
    
    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: `This resource requires: ${allowedTypes.join(', ')}. You are: ${req.user.userType}`
      });
    }
    
    next();
  };
};

// Optional: Middleware to check ownership
const requireOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const record = await model.findOne({
        where: { id: req.params[paramName] }
      });
      
      if (!record) {
        return res.status(404).json({ error: "Record not found" });
      }
      
      // Business owners can access their own records and their shopkeepers' records
      if (req.user.userType === 'businessowner') {
        if (record.businessOwnerId === req.user.id || record.userId === req.user.id) {
          return next();
        }
      }
      
      // Shopkeepers can only access records from their business owner
      if (req.user.userType === 'shopkeeper') {
        if (record.businessOwnerId === req.user.businessOwnerId) {
          return next();
        }
      }
      
      // Storekeepers can access records from their business owner
      if (req.user.userType === 'storekeeper') {
        if (record.businessOwnerId === req.user.businessOwnerId) {
          return next();
        }
      }
      
      // Default: user can only access their own records
      if (record.userId === req.user.id) {
        return next();
      }
      
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this resource"
      });
      
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({ error: "Server error during ownership verification" });
    }
  };
};

// Optional: Rate limiting middleware for authentication attempts
const rateLimitAuth = require("express-rate-limit");

const authRateLimiter = rateLimitAuth({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many authentication attempts",
    message: "Please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { 
  validateToken, 
  requireUserType, 
  requireOwnership,
  authRateLimiter 
};