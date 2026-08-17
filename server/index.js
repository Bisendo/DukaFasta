"use strict";

// =====================================================
// ENVIRONMENT - LOAD FIRST
// =====================================================

const path = require("path");
const dotenv = require("dotenv");
const dns = require("dns");

// =====================================================
// FORCE IPv4
// =====================================================

try {
    dns.setDefaultResultOrder("ipv4first");

    console.log(
        "🌐 DNS configured: IPv4 first"
    );
} catch (error) {
    console.warn(
        "⚠️ IPv4 configuration warning:",
        error.message
    );
}

// =====================================================
// LOAD .ENV
// =====================================================
//
// IMPORTANT:
// Do NOT use override: true.
// Environment variables provided by Render,
// Railway, Docker, etc. should be respected.
//
// =====================================================

const envResult =
    dotenv.config({
        path:
            path.join(
                __dirname,
                ".env"
            )
    });

if (envResult.error) {

    console.log(
        "ℹ️ No local .env file loaded."
    );

    console.log(
        "ℹ️ Using system environment variables."
    );

} else {

    console.log(
        "✅ .env file loaded successfully."
    );
}

// =====================================================
// ENVIRONMENT LOG
// =====================================================

console.log("");
console.log("========================================");
console.log("ENVIRONMENT CONFIGURATION");
console.log("========================================");

console.log(
    "DB_HOST:",
    process.env.DB_HOST
        ? "CONFIGURED"
        : "MISSING"
);

console.log(
    "DB_PORT:",
    process.env.DB_PORT
        ? "CONFIGURED"
        : "MISSING"
);

console.log(
    "DB_USER:",
    process.env.DB_USER
        ? "CONFIGURED"
        : "MISSING"
);

console.log(
    "DB_NAME:",
    process.env.DB_NAME
        ? "CONFIGURED"
        : "MISSING"
);

console.log(
    "DB_PASSWORD:",
    process.env.DB_PASSWORD
        ? "LOADED"
        : "MISSING"
);

console.log("----------------------------------------");

console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER
        ? "CONFIGURED"
        : "MISSING"
);

console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS
        ? "LOADED"
        : "MISSING"
);

console.log(
    "EMAIL_PASS LENGTH:",
    process.env.EMAIL_PASS
        ? process.env.EMAIL_PASS.length
        : 0
);

console.log(
    "EMAIL_HOST:",
    process.env.EMAIL_HOST ||
        "smtp.gmail.com"
);

console.log(
    "EMAIL_PORT:",
    process.env.EMAIL_PORT ||
        "587"
);

console.log(
    "EMAIL_SECURE:",
    process.env.EMAIL_SECURE ||
        "false"
);

console.log(
    "FRONTEND_URL:",
    process.env.FRONTEND_URL ||
        "http://localhost:3000"
);

console.log("========================================");
console.log("");