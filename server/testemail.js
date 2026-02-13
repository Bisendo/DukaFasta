// testEmail.js
const emailService = require('./Services/emailService');

async function testSendEmail() {
  const shopkeeperData = {
    firstName: "Bidaus",
    lastName: "Kimoto",
    email: "kimarodamiankimarodamian123@gmail.com"  // Use a test email address you have access to
  };
  const password = "TestPassword123";  // temporary password
  const ownerName = "Owner";           // your name or admin name

  console.log("📨 Sending test email...");

  const result = await emailService.sendShopkeeperCredentials(shopkeeperData, password, ownerName);

  if (result.success) {
    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", result.messageId);
  } else {
    console.error("❌ Failed to send test email:");
    console.error(result.error);
  }
}

testSendEmail();
