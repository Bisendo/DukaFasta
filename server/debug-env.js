// debug-env.js
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

console.log('========================================');
console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES');
console.log('========================================\n');

// Check current directory
console.log('📁 Current directory:', __dirname);
console.log('📁 Process CWD:', process.cwd());

// Check if .env exists in various locations
const locations = [
    { name: 'Server root', path: path.join(__dirname, '.env') },
    { name: 'Parent directory', path: path.join(__dirname, '../.env') },
    { name: 'Project root', path: path.join(__dirname, '../../.env') },
    { name: 'Current working directory', path: path.join(process.cwd(), '.env') },
];

console.log('\n📄 Checking .env file locations:');
locations.forEach(loc => {
    const exists = fs.existsSync(loc.path);
    console.log(`  ${loc.name}: ${loc.path}`);
    console.log(`    Exists: ${exists ? '✅' : '❌'}`);
    
    if (exists) {
        try {
            const content = fs.readFileSync(loc.path, 'utf8');
            const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            console.log(`    Lines: ${lines.length}`);
            
            // Check for EMAIL_ variables
            const emailVars = lines.filter(line => line.includes('EMAIL_'));
            console.log(`    EMAIL vars: ${emailVars.length}`);
            emailVars.forEach(v => {
                const parts = v.split('=');
                if (parts[0] === 'EMAIL_PASS') {
                    console.log(`      ${parts[0]}=${'*'.repeat(Math.min(parts[1]?.length || 0, 20))}`);
                } else {
                    console.log(`      ${v}`);
                }
            });
        } catch (e) {
            console.log(`    Error reading: ${e.message}`);
        }
    }
    console.log('');
});

// Try loading from each location
console.log('🔄 Attempting to load .env from each location:');
locations.forEach(loc => {
    if (fs.existsSync(loc.path)) {
        const result = dotenv.config({ path: loc.path });
        if (!result.error) {
            console.log(`  ✅ Loaded from: ${loc.path}`);
            console.log(`     EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
            console.log(`     EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET'}`);
        } else {
            console.log(`  ❌ Failed to load from: ${loc.path}`);
        }
    }
});

console.log('\n========================================');
console.log('📊 Current process.env EMAIL variables:');
console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET'}`);
console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
console.log('========================================');