const nodemailer = require('nodemailer');

// Hardcoded email credentials
const EMAIL_USER = 'kimotobidaus@gmail.com';
const EMAIL_PASS = 'kqpkavnickejtwry';

// Create transporter with IPv4 preference and better configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587, // Use 587 instead of 465
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false, // Only for development
    ciphers: 'SSLv3'
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  // Force IPv4
  lookup: (hostname, options, callback) => {
    const dns = require('dns');
    dns.lookup(hostname, { family: 4 }, callback); // Force IPv4
  }
});

// Check connection with better error handling
transporter.verify(function(error, success) {
  if (error) {
    console.log("❌ Email connection failed:", error.message);
    console.log("Trying alternative configuration...");
    
    // Try alternative configuration
    setTimeout(() => {
      testAlternativeConfig();
    }, 2000);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// Alternative configuration test
async function testAlternativeConfig() {
  try {
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      },
      lookup: (hostname, options, callback) => {
        const dns = require('dns');
        dns.lookup(hostname, { family: 4 }, callback);
      }
    });
    
    await testTransporter.verify();
    console.log("✅ Alternative configuration works!");
  } catch (err) {
    console.log("❌ Alternative configuration also failed:", err.message);
  }
}

class EmailService {
  // Send OTP for password reset
  async sendOTPEmail(email, otp, firstName) {
    const subject = 'Password Reset OTP - DukaFasta';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .otp-box { background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
          .warning { background-color: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #2563eb;">DukaFasta</h1>
            <p>Password Reset Request</p>
          </div>
          
          <p>Hello <strong>${firstName}</strong>,</p>
          <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="color: #666; margin-top: 10px;">This code will expire in 10 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            If you didn't request this password reset, please ignore this email or contact support.
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message, please do not reply.<br>
            © ${new Date().getFullYear()} DukaFasta. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`📧 Attempting to send OTP email to ${email}...`);
      
      const info = await transporter.sendMail({
        from: `"DukaFasta" <${EMAIL_USER}>`,
        to: email,
        subject,
        html
      });

      console.log(`✅ OTP email sent successfully to ${email}`);
      console.log('Message ID:', info.messageId);
      
      return { 
        success: true, 
        email, 
        messageId: info.messageId 
      };
      
    } catch (error) {
      console.error('❌ Detailed error sending OTP email:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      
      // Try alternative SMTP settings as fallback
      return await this.tryAlternativeSMTPSettings(email, otp, firstName);
    }
  }

  // Fallback method with alternative SMTP settings
  async tryAlternativeSMTPSettings(email, otp, firstName) {
    try {
      console.log('🔄 Trying alternative SMTP settings...');
      
      const alternativeTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const subject = 'Password Reset OTP - DukaFasta';
      const html = `Your OTP code is: ${otp}`; // Simplified HTML for fallback

      const info = await alternativeTransporter.sendMail({
        from: `"DukaFasta" <${EMAIL_USER}>`,
        to: email,
        subject,
        html
      });

      console.log(`✅ OTP email sent via alternative method to ${email}`);
      return { success: true, email, messageId: info.messageId };
      
    } catch (fallbackError) {
      console.error('❌ Alternative SMTP also failed:', fallbackError.message);
      return { 
        success: false, 
        error: fallbackError.message 
      };
    }
  }

  // Keep your other methods unchanged...
  async sendWelcomeEmail(user) {
    // ... existing code
  }

  async sendShopkeeperCredentials(shopkeeper, password, ownerName) {
    // ... existing code
  }

  async sendPasswordResetConfirmation(email, firstName) {
    // ... existing code
  }
}

module.exports = new EmailService();