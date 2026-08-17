// test-email.js
const emailService = require('./Services/emailService');

async function test() {
    console.log('\n========================================');
    console.log('🧪 TESTING EMAIL SERVICE');
    console.log('========================================\n');

    // Get status
    const status = emailService.getStatus();
    console.log('📧 Email Service Status:');
    console.log(`  Configured: ${status.configured ? '✅ Yes' : '❌ No'}`);
    if (status.errors && status.errors.length > 0) {
        console.log(`  Errors: ${status.errors.join(', ')}`);
    }
    if (status.config) {
        console.log(`  User: ${status.config.user}`);
        console.log(`  Host: ${status.config.host}`);
        console.log(`  Port: ${status.config.port}`);
    }
    console.log('');

    // Test SMTP connection
    console.log('🔄 Testing SMTP connection...');
    const result = await emailService.verifyConnection();
    
    if (result.success) {
        console.log('✅ SMTP connection successful!\n');
        
        // Test sending email (optional)
        console.log('📧 Would you like to send a test email?');
        console.log('To test, uncomment the code below and add your email address.');
        
        // Uncomment to test sending an email
        /*
        const testResult = await emailService.testConfiguration('your-email@gmail.com');
        if (testResult.success) {
            console.log('✅ Test email sent successfully!');
            console.log(`📧 Message ID: ${testResult.messageId}`);
        } else {
            console.log('❌ Test email failed:', testResult.error);
        }
        */
    } else {
        console.log('❌ SMTP connection failed:');
        console.log(`  Error: ${result.error}`);
    }

    console.log('\n========================================');
}

test().catch(console.error);