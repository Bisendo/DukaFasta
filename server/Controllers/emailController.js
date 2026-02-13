const emailService = require('../Services/emailService');

class EmailController {
  // Test email service
  async testEmail(req, res) {
    try {
      return res.json({
        success: true,
        message: 'Email service is ready',
        config: { emailConfigured: true, frontendUrl: 'http://localhost:4001' }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Send welcome email after registration (owner or shopkeeper)
  async sendWelcome(req, res) {
    try {
      const { firstName, email, role } = req.body;
      if (!email || !role) {
        return res.status(400).json({ success: false, error: 'Email and role are required' });
      }

      const result = await emailService.sendWelcomeEmail({ firstName, email, role });

      if (result.success) return res.json({ success: true, message: 'Welcome email sent', data: result });
      return res.status(500).json({ success: false, error: result.error });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Failed to send welcome email' });
    }
  }

  // Send shopkeeper credentials
  async sendShopkeeperCredentials(req, res) {
    try {
      const { to, firstName, lastName, password, ownerName } = req.body;
      if (!to || !password || !ownerName) return res.status(400).json({ success: false, error: 'Missing required fields' });

      const shopkeeperData = { firstName: firstName || 'Shopkeeper', lastName: lastName || '', email: to };
      const result = await emailService.sendShopkeeperCredentials(shopkeeperData, password, ownerName);

      if (result.success) return res.json({ success: true, message: 'Credentials email sent', data: result });
      return res.status(500).json({ success: false, error: result.error });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Failed to send credentials email' });
    }
  }

  // Send password reset
  async sendPasswordReset(req, res) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) return res.status(400).json({ success: false, error: 'Email and newPassword required' });

      const result = await emailService.sendPasswordReset(email, newPassword);

      if (result.success) return res.json({ success: true, message: 'Password reset email sent', data: result });
      return res.status(500).json({ success: false, error: result.error });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Failed to send password reset email' });
    }
  }
}

module.exports = new EmailController();
