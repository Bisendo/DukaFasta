const express = require('express');
const router = express.Router();
const emailController = require('../Controllers/emailController');
const authenticateToken = require('../middlewares/authMiddlewares').validateToken;

// Test email connection (protected)
router.get('/test', authenticateToken, emailController.testEmail);

// Send shopkeeper credentials (protected)
router.post('/send-credentials', authenticateToken, emailController.sendShopkeeperCredentials);

// Send password reset (protected)
router.post('/send-password-reset', authenticateToken, emailController.sendPasswordReset);

// Send welcome email (protected)
router.post('/send-welcome', authenticateToken, emailController.sendWelcome);

module.exports = router;
