
const nodemailer = require('nodemailer');

// Hardcoded email credentials (replace with your email & password)
const EMAIL_USER = 'kimotobidaus@gmail.com';       // <-- your Gmail
const EMAIL_PASS = 'kqpkavnickejtwry';              // <-- your Gmail app password if 2FA enabled

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// check connection
transporter.verify(function(error, success) {
  if (error) {
    console.log("Email connection failed:", error);
  } else {
    console.log("Email connection successful:", success);
  }});

class EmailService {
  // Send welcome email for owner or shopkeeper
  async sendWelcomeEmail(user) {
    const { firstName, email, role } = user;
    const subject = `Welcome to DukaFasta, ${firstName}!`;
    const html = `
      <h2>Hello ${firstName},</h2>
      <p>Welcome to <b>DukaFasta</b>! 🎉</p>
      <p>You have successfully registered as a <b>${role}</b>.</p>
      <p>Start managing your store and enjoy our services!</p>
      <p>Best regards,<br/>The DukaFasta Team</p>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"DukaFasta" <${EMAIL_USER}>`,
        to: email,
        subject,
        html
      });

      return { success: true, email, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send shopkeeper credentials
  async sendShopkeeperCredentials(shopkeeper, password, ownerName) {
    const subject = 'Your Shopkeeper Account Credentials';
    const html = `
      <h2>Hello ${shopkeeper.firstName},</h2>
      <p>${ownerName} has added you as a shopkeeper in DukaFasta.</p>
      <p>Your login credentials are:</p>
      <ul>
        <li>Email: ${shopkeeper.email}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>Please login and change your password immediately.</p>
      <p>Best regards,<br/>The DukaFasta Team</p>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"DukaFasta" <${EMAIL_USER}>`,
        to: shopkeeper.email,
        subject,
        html
      });

      return { success: true, email: shopkeeper.email, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending credentials email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordReset(email, newPassword) {
    const subject = 'DukaFasta Password Reset';
    const html = `
      <p>Your password has been reset.</p>
      <p>New Password: ${newPassword}</p>
      <p>Please login and change it immediately.</p>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"DukaFasta" <${EMAIL_USER}>`,
        to: email,
        subject,
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
