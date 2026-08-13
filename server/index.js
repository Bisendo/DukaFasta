'use strict';

// =====================================================
// ENVIRONMENT - Load .env FIRST
// =====================================================

const path = require('path');
const dotenv = require('dotenv');

// Force IPv4 to fix email connection issues
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Load the .env file from the server directory
dotenv.config({
    path: path.join(__dirname, '.env'),
    override: true
});

console.log('');
console.log('========================================');
console.log('ENVIRONMENT CONFIGURATION');
console.log('========================================');
console.log('DB HOST:', process.env.DB_HOST);
console.log('DB PORT:', process.env.DB_PORT);
console.log('DB USER:', process.env.DB_USER);
console.log('DB NAME:', process.env.DB_NAME);
console.log('DB PASSWORD:', process.env.DB_PASSWORD ? 'LOADED' : 'MISSING');
console.log('----------------------------------------');
console.log('EMAIL CONFIGURATION');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'LOADED' : 'MISSING');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
console.log('========================================');
console.log('');

// =====================================================
// EXPRESS
// =====================================================

const express = require('express');
const cors = require('cors');

// =====================================================
// DATABASE
// =====================================================

const db = require('./models');

// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 4001;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

app.use(express.json({ limit: '10mb' }));

app.use(
    express.urlencoded({
        extended: true,
        limit: '10mb'
    })
);

// =====================================================
// REQUEST LOGGING MIDDLEWARE
// =====================================================

app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path}`);
    next();
});

// =====================================================
// UPLOADS
// =====================================================

app.use(
    '/uploads',
    express.static(
        path.join(__dirname, 'uploads')
    )
);

// =====================================================
// ROUTES
// =====================================================

// -----------------------------------------------------
// AUTH
// -----------------------------------------------------

try {
    const userRouter = require('./routes/Users');

    app.use('/auth', userRouter);

    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error(
        '❌ Failed to load auth routes:',
        error.message
    );
}

// -----------------------------------------------------
// PRODUCTS
// -----------------------------------------------------

try {
    const productRouter = require('./routes/Products');

    app.use('/products', productRouter);

    console.log('✅ Product routes loaded');
} catch (error) {
    console.error(
        '❌ Failed to load product routes:',
        error.message
    );
}

// -----------------------------------------------------
// SALES
// -----------------------------------------------------

try {
    const salesRouter = require('./routes/Sales');

    app.use('/sales', salesRouter);

    console.log('✅ Sales routes loaded');
} catch (error) {
    console.error(
        '❌ Failed to load sales routes:',
        error.message
    );
}

// -----------------------------------------------------
// EMAIL - Load email routes
// -----------------------------------------------------

try {
    // Check if email routes file exists
    const emailRoutesPath = path.join(__dirname, 'routes', 'emailroutes.js');
    const fs = require('fs');
    
    if (fs.existsSync(emailRoutesPath)) {
        const emailRoutes = require('./routes/emailroutes');
        app.use('/email', emailRoutes);
        console.log('✅ Email routes loaded from ./routes/emailroutes.js');
    } else {
        console.warn('⚠️ Email routes file not found at ./routes/emailroutes.js');
        
        // Create a basic email route if file doesn't exist
        const emailRouter = express.Router();
        const EmailService = require('./Services/emailService');
        
        emailRouter.get('/test', async (req, res) => {
            try {
                const testEmail = req.query.email || 'test@example.com';
                const result = await EmailService.testEmailConfiguration(testEmail);
                res.json({
                    success: result.success,
                    message: result.success ? 'Test email sent successfully' : 'Test email failed',
                    details: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        app.use('/email', emailRouter);
        console.log('✅ Basic email routes created');
    }
} catch (error) {
    console.error(
        '❌ Failed to load email routes:',
        error.message
    );
}

// -----------------------------------------------------
// USERS
// -----------------------------------------------------

try {
    const userManagementRoutes = require('./routes/Users');

    app.use('/users', userManagementRoutes);

    console.log('✅ User routes loaded');
} catch (error) {
    console.error(
        '❌ Failed to load user routes:',
        error.message
    );
}

// =====================================================
// ROOT ENDPOINT
// =====================================================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Inventory Management System API',
        version: '2.0.0',
        endpoints: {
            auth: '/auth',
            products: '/products',
            sales: '/sales',
            email: '/email',
            users: '/users',
            health: '/health',
            'test-email': '/email/test?email=your-email@example.com'
        }
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await db.sequelize.authenticate();
        
        // Check email service
        let emailStatus = 'not tested';
        try {
            const EmailService = require('./Services/emailService');
            if (EmailService.transporter) {
                const isVerified = await EmailService.transporter.verify();
                emailStatus = isVerified ? 'connected' : 'disconnected';
            } else {
                emailStatus = 'not configured';
            }
        } catch (emailError) {
            emailStatus = 'error: ' + emailError.message;
        }

        res.status(200).json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                auth: 'active',
                products: 'active',
                sales: 'active',
                users: 'active',
                email: emailStatus
            }
        });

    } catch (error) {
        console.error(
            '❌ Health check database error:',
            error.message
        );

        res.status(500).json({
            success: false,
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'disconnected'
            },
            error: error.message
        });
    }
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        availableEndpoints: {
            '/': 'API Information',
            '/health': 'Health Check',
            '/auth': 'Authentication',
            '/auth/login': 'Login',
            '/users': 'User Management',
            '/users/shopkeeper/:ownerId': 'Create Shopkeeper',
            '/users/shopkeepers/:ownerId': 'Get Shopkeepers',
            '/products': 'Product Management',
            '/sales': 'Sales Management',
            '/email': 'Email Service',
            '/email/test': 'Test Email'
        }
    });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {
        console.error('❌ Server error:', err);
        
        const statusCode = err.status || err.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            error: err.message || 'Internal server error',
            path: req.originalUrl,
            timestamp: new Date().toISOString()
        });
    }
);

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

let dbInitialized = false;
let initializationPromise = null;

async function initializeDatabase() {
    // Already connected
    if (dbInitialized) {
        return true;
    }

    // Prevent multiple simultaneous initialization attempts
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        console.log('');
        console.log('========================================');
        console.log('DATABASE INITIALIZATION');
        console.log('========================================');

        // -------------------------------------------------
        // VALIDATE ENVIRONMENT
        // -------------------------------------------------

        const requiredVariables = [
            'DB_HOST',
            'DB_PORT',
            'DB_NAME',
            'DB_USER',
            'DB_PASSWORD'
        ];

        let missingVariables = [];
        for (const variable of requiredVariables) {
            if (!process.env[variable]) {
                missingVariables.push(variable);
            }
        }

        if (missingVariables.length > 0) {
            throw new Error(
                `Missing environment variables: ${missingVariables.join(', ')}`
            );
        }

        console.log('✅ Database environment variables found');

        // -------------------------------------------------
        // DATABASE CONNECTION WITH RETRIES
        // -------------------------------------------------

        const maxAttempts = 5;
        let lastError = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`🔄 Database connection attempt ${attempt}/${maxAttempts}...`);
                await db.sequelize.authenticate();
                console.log('✅ Database connection successful');
                break;
            } catch (error) {
                lastError = error;
                console.error(`❌ Database attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxAttempts) {
                    const waitTime = attempt * 3000;
                    console.log(`⏳ Waiting ${waitTime / 1000} seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        // -------------------------------------------------
        // CHECK IF CONNECTION EVENTUALLY FAILED
        // -------------------------------------------------

        if (lastError) {
            try {
                await db.sequelize.authenticate();
            } catch (error) {
                throw error;
            }
        }

        // -------------------------------------------------
        // SYNCHRONIZE DATABASE
        // -------------------------------------------------

        console.log('🔄 Synchronizing database models...');
        await db.sequelize.sync();
        console.log('✅ Database synchronized');

        // -------------------------------------------------
        // CHECK MODELS
        // -------------------------------------------------

        if (db.User) {
            console.log('✅ User model ready');
        } else {
            console.warn('⚠️ User model not found');
        }

        if (db.Product) {
            console.log('✅ Product model ready');
        } else {
            console.warn('⚠️ Product model not found');
        }

        if (db.Sale) {
            console.log('✅ Sale model ready');
        } else {
            console.warn('⚠️ Sale model not found');
        }

        // -------------------------------------------------
        // DATABASE READY
        // -------------------------------------------------

        dbInitialized = true;

        console.log('');
        console.log('========================================');
        console.log('✅ DATABASE READY');
        console.log('========================================');
        console.log('');

        return true;
    })();

    try {
        return await initializationPromise;
    } catch (error) {
        initializationPromise = null;
        throw error;
    }
}

// =====================================================
// START SERVER
// =====================================================

if (require.main === module) {
    initializeDatabase()
        .then(async () => {
            // Test email configuration on startup
            try {
                const EmailService = require('./Services/emailService');
                if (EmailService.transporter) {
                    await EmailService.transporter.verify();
                    console.log('✅ Email service verified and ready');
                }
            } catch (emailError) {
                console.warn('⚠️ Email service not ready:', emailError.message);
                console.warn('⚠️ Please check your EMAIL_USER and EMAIL_PASS in .env');
            }

            app.listen(PORT, () => {
                console.log('');
                console.log('========================================');
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`🌐 API: http://localhost:${PORT}`);
                console.log(`❤️ Health: http://localhost:${PORT}/health`);
                console.log(`📧 Test Email: http://localhost:${PORT}/email/test?email=your-email@example.com`);
                console.log('========================================');
                console.log('');
            });
        })
        .catch(error => {
            console.error('');
            console.error('❌ Failed to start server');
            console.error(error.message);
            console.error('');
            process.exit(1);
        });
}

// =====================================================
// EXPORT FOR VERCEL / OTHER HOSTING
// =====================================================

module.exports = app;