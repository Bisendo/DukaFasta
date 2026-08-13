// Controllers/emailController.js
const emailService = require('../Services/emailService');
require("dotenv").config();

class EmailController {
  
  // ===================================================
  // TEST EMAIL SERVICE
  // ===================================================
  
  async testEmail(req, res) {
    try {
      // Get test email from query params
      const testEmail = req.query.email;
      
      if (testEmail) {
        // If email provided, send actual test email
        console.log('🧪 Sending test email to:', testEmail);
        
        const result = await emailService.sendShopkeeperCredentials(
          { firstName: 'Test', lastName: 'User', email: testEmail },
          'test123',
          'DukaFasta System'
        );
        
        if (result.success) {
          return res.json({
            success: true,
            message: 'Test email sent successfully',
            data: {
              to: testEmail,
              messageId: result.messageId,
              details: result
            }
          });
        } else {
          return res.status(500).json({
            success: false,
            error: 'Failed to send test email',
            details: result.error
          });
        }
      }
      
      // If no email provided, just return service status
      const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
      
      // Check if transporter is working
      let transporterStatus = 'unknown';
      if (emailConfigured) {
        try {
          await emailService.transporter.verify();
          transporterStatus = 'connected';
        } catch (verifyError) {
          transporterStatus = 'disconnected';
        }
      }
      
      return res.json({
        success: true,
        message: 'Email service status',
        data: {
          emailConfigured: emailConfigured,
          transporterStatus: transporterStatus,
          emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not set',
          frontendUrl: process.env.FRONTEND_URL || 'https://dukafasta.onrender.com',
          tips: emailConfigured ? 
            'Email service is configured. Use ?email=test@example.com to send a test email.' :
            'Email service is not configured. Please add EMAIL_USER and EMAIL_PASS to .env'
        }
      });
      
    } catch (error) {
      console.error('❌ Test email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // ===================================================
  // SEND WELCOME EMAIL
  // ===================================================
  
  async sendWelcome(req, res) {
    try {
      const { firstName, email, role, lastName } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and role are required' 
        });
      }

      console.log('📧 Sending welcome email to:', email);
      console.log('Role:', role);

      const user = {
        firstName: firstName || 'User',
        lastName: lastName || '',
        email: email,
        role: role
      };

      const result = await emailService.sendWelcomeEmail(user);

      if (result.success) {
        return res.json({ 
          success: true, 
          message: 'Welcome email sent successfully',
          data: {
            to: email,
            messageId: result.messageId,
            details: result
          }
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to send welcome email',
          details: result
        });
      }
      
    } catch (error) {
      console.error('❌ Send welcome email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send welcome email',
        details: error.message
      });
    }
  }

  // ===================================================
  // SEND SHOPKEEPER CREDENTIALS
  // ===================================================
  
  async sendShopkeeperCredentials(req, res) {
    try {
      const { to, firstName, lastName, password, ownerName } = req.body;
      
      if (!to || !password || !ownerName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: to, password, ownerName' 
        });
      }

      console.log('📧 Sending shopkeeper credentials to:', to);
      console.log('Owner:', ownerName);

      const shopkeeperData = {
        firstName: firstName || 'Shopkeeper',
        lastName: lastName || '',
        email: to
      };

      const result = await emailService.sendShopkeeperCredentials(
        shopkeeperData, 
        password, 
        ownerName
      );

      if (result.success) {
        return res.json({ 
          success: true, 
          message: 'Shopkeeper credentials email sent successfully',
          data: {
            to: to,
            messageId: result.messageId,
            details: result
          }
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to send credentials email',
          details: result
        });
      }
      
    } catch (error) {
      console.error('❌ Send credentials email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send credentials email',
        details: error.message
      });
    }
  }

  // ===================================================
  // SEND PASSWORD RESET
  // ===================================================
  
  async sendPasswordReset(req, res) {
    try {
      const { email, newPassword, firstName } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and newPassword are required' 
        });
      }

      console.log('📧 Sending password reset confirmation to:', email);

      // Send password reset confirmation
      const result = await emailService.sendPasswordResetConfirmation(
        email,
        firstName || 'User'
      );

      if (result.success) {
        return res.json({ 
          success: true, 
          message: 'Password reset confirmation email sent successfully',
          data: {
            to: email,
            messageId: result.messageId,
            details: result
          }
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to send password reset email',
          details: result
        });
      }
      
    } catch (error) {
      console.error('❌ Send password reset email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send password reset email',
        details: error.message
      });
    }
  }

  // ===================================================
  // SEND PASSWORD RESET OTP (Additional method)
  // ===================================================
  
  async sendPasswordResetOTP(req, res) {
    try {
      const { email, otp, firstName } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and OTP are required' 
        });
      }

      console.log('📧 Sending password reset OTP to:', email);

      const result = await emailService.sendOTPEmail(
        email,
        otp,
        firstName || 'User'
      );

      if (result.success) {
        return res.json({ 
          success: true, 
          message: 'Password reset OTP sent successfully',
          data: {
            to: email,
            messageId: result.messageId,
            details: result
          }
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to send OTP email',
          details: result
        });
      }
      
    } catch (error) {
      console.error('❌ Send OTP email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send OTP email',
        details: error.message
      });
    }
  }

  // ===================================================
  // EMAIL STATUS (Additional method)
  // ===================================================
  
  async emailStatus(req, res) {
    try {
      const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
      
      let status = 'not configured';
      let details = {};
      
      if (emailConfigured) {
        status = 'configured';
        
        try {
          // Try to verify the transporter
          await emailService.transporter.verify();
          status = 'ready';
          details.verification = 'successful';
        } catch (verifyError) {
          status = 'error';
          details.verification = 'failed';
          details.error = verifyError.message;
        }
      } else {
        details.message = 'EMAIL_USER or EMAIL_PASS is missing in .env';
      }
      
      return res.json({
        success: true,
        status: status,
        emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not set',
        frontendUrl: process.env.FRONTEND_URL || 'https://dukafasta.onrender.com',
        details: details
      });
      
    } catch (error) {
      console.error('❌ Email status error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new EmailController();