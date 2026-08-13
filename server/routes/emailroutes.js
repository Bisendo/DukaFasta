const express = require('express');
const router = express.Router();
const emailController = require('../Controllers/emailController');
const authenticateToken = require('../middlewares/authMiddlewares').validateToken;

// =====================================================
// PUBLIC EMAIL ROUTES (No authentication required)
// =====================================================

// Test email configuration (PUBLIC - for testing)
router.get('/test-public', async (req, res) => {
    try {
        const testEmail = req.query.email;
        
        if (!testEmail) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email address: ?email=your-email@example.com'
            });
        }

        // Import EmailService directly for testing
        const EmailService = require('../Services/emailService');
        
        const result = await EmailService.testEmailConfiguration(testEmail);
        
        res.json({
            success: result.success,
            message: result.success ? 'Test email sent successfully' : 'Test email failed',
            details: result
        });

    } catch (error) {
        console.error('❌ Test email route error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check email service status (PUBLIC)
router.get('/status', async (req, res) => {
    try {
        const EmailService = require('../Services/emailService');
        
        let status = 'unknown';
        let details = {};
        
        // Check if email is configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            status = 'configured';
            
            // Try to verify connection
            try {
                await EmailService.transporter.verify();
                status = 'ready';
                details.verification = 'successful';
            } catch (verifyError) {
                status = 'error';
                details.verification = 'failed';
                details.error = verifyError.message;
            }
        } else {
            status = 'not configured';
            details.message = 'EMAIL_USER or EMAIL_PASS is missing in .env';
        }
        
        res.json({
            success: true,
            status: status,
            emailUser: process.env.EMAIL_USER || 'Not set',
            details: details
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =====================================================
// PROTECTED EMAIL ROUTES (Authentication required)
// =====================================================

// Test email connection (protected)
router.get('/test', authenticateToken, emailController.testEmail);

// Send shopkeeper credentials (protected)
router.post('/send-credentials', authenticateToken, emailController.sendShopkeeperCredentials);

// Send password reset (protected)
router.post('/send-password-reset', authenticateToken, emailController.sendPasswordReset);

// Send welcome email (protected)
router.post('/send-welcome', authenticateToken, emailController.sendWelcome);

module.exports = router;