'use strict';

// =====================================================
// DukaFasta - Main Server
// =====================================================

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const dns = require('dns');

// =====================================================
// FORCE IPv4
// =====================================================

try {
    dns.setDefaultResultOrder('ipv4first');
    console.log('🌐 DNS configured: IPv4 first');
} catch (error) {
    console.warn(
        '⚠️ Could not configure IPv4 first:',
        error.message
    );
}

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({
        path: envPath,
        override: true
    });

    console.log(`✅ Environment loaded from: ${envPath}`);
} else {
    dotenv.config();

    console.warn(
        '⚠️ .env file not found in server directory'
    );
}

// =====================================================
// ENVIRONMENT CONFIGURATION LOG
// =====================================================

console.log('');
console.log('========================================');
console.log('ENVIRONMENT CONFIGURATION');
console.log('========================================');

console.log(
    'DB HOST:',
    process.env.DB_HOST || 'MISSING'
);

console.log(
    'DB PORT:',
    process.env.DB_PORT || 'MISSING'
);

console.log(
    'DB USER:',
    process.env.DB_USER || 'MISSING'
);

console.log(
    'DB NAME:',
    process.env.DB_NAME || 'MISSING'
);

console.log(
    'DB PASSWORD:',
    process.env.DB_PASSWORD
        ? 'LOADED'
        : 'MISSING'
);

console.log('----------------------------------------');

console.log('EMAIL CONFIGURATION');

console.log(
    'EMAIL USER:',
    process.env.EMAIL_USER || 'MISSING'
);

console.log(
    'EMAIL PASS:',
    process.env.EMAIL_PASS
        ? `LOADED (${process.env.EMAIL_PASS.length} characters)`
        : 'MISSING'
);

console.log(
    'EMAIL HOST:',
    process.env.EMAIL_HOST || 'smtp.gmail.com'
);

console.log(
    'EMAIL PORT:',
    process.env.EMAIL_PORT || '587'
);

console.log(
    'EMAIL SECURE:',
    process.env.EMAIL_SECURE || 'false'
);

console.log(
    'FRONTEND URL:',
    process.env.FRONTEND_URL || 'http://localhost:3000'
);

console.log('========================================');
console.log('');

// =====================================================
// EXPRESS
// =====================================================

const express = require('express');
const cors = require('cors');

const app = express();

const PORT =
    Number(process.env.PORT) || 4001;

// =====================================================
// DATABASE
// =====================================================

const db = require('./models');

// =====================================================
// EMAIL SERVICE
// =====================================================

let EmailService = null;

try {
    EmailService = require('./Services/emailService');

    console.log(
        '✅ EmailService loaded successfully'
    );
} catch (error) {
    console.error(
        '❌ Failed to load EmailService:',
        error.message
    );
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: true,
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })
);

app.use(
    express.json({
        limit: '10mb'
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: '10mb'
    })
);

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
    console.log(
        `📝 ${req.method} ${req.path}`
    );

    next();
});

// =====================================================
// UPLOADS
// =====================================================

const uploadsPath =
    path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(
        uploadsPath,
        {
            recursive: true
        }
    );

    console.log(
        `📁 Created uploads directory: ${uploadsPath}`
    );
}

app.use(
    '/uploads',
    express.static(uploadsPath)
);

// =====================================================
// AUTH / USERS ROUTES
// =====================================================

try {
    const userRouter =
        require('./routes/Users');

    // Use the Users router for user APIs
    app.use('/users', userRouter);

    console.log(
        '✅ User routes loaded at /users'
    );

} catch (error) {

    console.error(
        '❌ Failed to load Users routes:',
        error.message
    );
}

// =====================================================
// PRODUCTS ROUTES
// =====================================================

try {
    const productRouter =
        require('./routes/Products');

    app.use(
        '/products',
        productRouter
    );

    console.log(
        '✅ Product routes loaded'
    );

} catch (error) {

    console.error(
        '❌ Failed to load Product routes:',
        error.message
    );
}

// =====================================================
// SALES ROUTES
// =====================================================

try {
    const salesRouter =
        require('./routes/Sales');

    app.use(
        '/sales',
        salesRouter
    );

    console.log(
        '✅ Sales routes loaded'
    );

} catch (error) {

    console.error(
        '❌ Failed to load Sales routes:',
        error.message
    );
}

// =====================================================
// EMAIL ROUTES
// =====================================================

try {

    const emailRoutesPath =
        path.join(
            __dirname,
            'routes',
            'emailroutes.js'
        );

    if (fs.existsSync(emailRoutesPath)) {

        const emailRouter =
            require('./routes/emailroutes');

        app.use(
            '/email',
            emailRouter
        );

        console.log(
            '✅ Email routes loaded from /routes/emailroutes.js'
        );

    } else {

        console.log(
            'ℹ️ emailroutes.js not found'
        );

        // ---------------------------------------------
        // BASIC TEST EMAIL ROUTE
        // ---------------------------------------------

        const emailRouter =
            express.Router();

        emailRouter.get(
            '/test',
            async (req, res) => {

                try {

                    if (!EmailService) {

                        return res.status(500).json({
                            success: false,
                            error:
                                'Email service could not be loaded.'
                        });

                    }

                    const testEmail =
                        String(
                            req.query.email || ''
                        ).trim();

                    if (!testEmail) {

                        return res.status(400).json({
                            success: false,
                            error:
                                'Please provide an email address.'
                        });
                    }

                    const result =
                        await EmailService.testEmailConfiguration(
                            testEmail
                        );

                    return res.status(
                        result.success
                            ? 200
                            : 500
                    ).json({
                        success:
                            result.success,

                        message:
                            result.success
                                ? 'Test email sent successfully.'
                                : 'Test email failed.',

                        details:
                            result
                    });

                } catch (error) {

                    console.error(
                        '❌ Test email route error:',
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        error:
                            error.message
                    });
                }
            }
        );

        app.use(
            '/email',
            emailRouter
        );

        console.log(
            '✅ Basic email test route created'
        );
    }

} catch (error) {

    console.error(
        '❌ Failed to load email routes:',
        error.message
    );
}

// =====================================================
// ROOT ENDPOINT
// =====================================================

app.get(
    '/',
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                'DukaFasta Inventory Management System API',

            version:
                '2.0.0',

            server:
                'running',

            endpoints: {

                root:
                    '/',

                health:
                    '/health',

                users:
                    '/users',

                login:
                    '/users/login',

                owner:
                    '/users/owner',

                createShopkeeper:
                    '/users/shopkeeper/:ownerId',

                shopkeepers:
                    '/users/shopkeepers/:ownerId',

                emailStatus:
                    '/users/email-status',

                products:
                    '/products',

                sales:
                    '/sales',

                email:
                    '/email',

                testEmail:
                    '/email/test?email=your-email@example.com'
            }
        });
    }
);

// =====================================================
// HEALTH CHECK
// GET /health
// =====================================================

app.get(
    '/health',
    async (req, res) => {

        const health = {

            success: true,

            status: 'healthy',

            timestamp:
                new Date().toISOString(),

            services: {

                database:
                    'unknown',

                email:
                    'unknown',

                users:
                    'active',

                products:
                    'active',

                sales:
                    'active'
            }
        };

        // ---------------------------------------------
        // DATABASE CHECK
        // ---------------------------------------------

        try {

            await db.sequelize.authenticate();

            health.services.database =
                'connected';

        } catch (error) {

            console.error(
                '❌ Health database check failed:',
                error.message
            );

            health.success = false;

            health.status =
                'unhealthy';

            health.services.database =
                'disconnected';

            health.databaseError =
                error.message;
        }

        // ---------------------------------------------
        // EMAIL CHECK
        // ---------------------------------------------

        try {

            if (!EmailService) {

                health.success = false;

                health.status =
                    'degraded';

                health.services.email =
                    'service unavailable';

            } else if (
                typeof EmailService.verifySMTP !==
                'function'
            ) {

                health.success = false;

                health.status =
                    'degraded';

                health.services.email =
                    'verification unavailable';

            } else {

                const emailResult =
                    await EmailService.verifySMTP();

                if (
                    emailResult &&
                    emailResult.success === true
                ) {

                    health.services.email =
                        'connected';

                } else {

                    health.success = false;

                    health.status =
                        'degraded';

                    health.services.email =
                        'not connected';

                    health.emailError =
                        emailResult?.error ||
                        'Email verification failed.';
                }
            }

        } catch (error) {

            console.error(
                '❌ Health email check failed:',
                error.message
            );

            health.success = false;

            health.status =
                'degraded';

            health.services.email =
                'error';

            health.emailError =
                error.message;
        }

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(
            health.services.database ===
                'connected'
                ? 200
                : 503
        ).json(health);
    }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                'Route not found',

            path:
                req.originalUrl,

            method:
                req.method,

            availableEndpoints: {

                root:
                    'GET /',

                health:
                    'GET /health',

                login:
                    'POST /users/login',

                owner:
                    'POST /users/owner',

                createShopkeeper:
                    'POST /users/shopkeeper/:ownerId',

                getShopkeepers:
                    'GET /users/shopkeepers/:ownerId',

                emailStatus:
                    'GET /users/email-status',

                testEmail:
                    'GET /email/test?email=your-email@example.com',

                products:
                    '/products',

                sales:
                    '/sales'
            }
        });
    }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            '❌ GLOBAL SERVER ERROR:',
            err
        );

        const statusCode =
            err.status ||
            err.statusCode ||
            500;

        res.status(statusCode).json({

            success: false,

            error:
                err.message ||
                'Internal server error',

            path:
                req.originalUrl,

            timestamp:
                new Date().toISOString()
        });
    }
);

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

let dbInitialized = false;

let initializationPromise =
    null;

async function initializeDatabase() {

    if (dbInitialized) {
        return true;
    }

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise =
        (async () => {

            console.log('');
            console.log(
                '========================================'
            );
            console.log(
                'DATABASE INITIALIZATION'
            );
            console.log(
                '========================================'
            );

            // -----------------------------------------
            // REQUIRED DATABASE VARIABLES
            // -----------------------------------------

            const requiredVariables = [
                'DB_HOST',
                'DB_PORT',
                'DB_NAME',
                'DB_USER',
                'DB_PASSWORD'
            ];

            const missingVariables =
                requiredVariables.filter(
                    variable =>
                        !process.env[variable]
                );

            if (
                missingVariables.length > 0
            ) {

                throw new Error(
                    `Missing environment variables: ${missingVariables.join(', ')}`
                );
            }

            console.log(
                '✅ Database environment variables found'
            );

            // -----------------------------------------
            // DATABASE CONNECTION
            // -----------------------------------------

            const maxAttempts = 5;

            let connected = false;

            let lastError = null;

            for (
                let attempt = 1;
                attempt <= maxAttempts;
                attempt++
            ) {

                try {

                    console.log(
                        `🔄 Database connection attempt ${attempt}/${maxAttempts}...`
                    );

                    await db.sequelize.authenticate();

                    connected = true;

                    console.log(
                        '✅ Database connection successful'
                    );

                    break;

                } catch (error) {

                    lastError = error;

                    console.error(
                        `❌ Database attempt ${attempt} failed:`,
                        error.message
                    );

                    if (
                        attempt <
                        maxAttempts
                    ) {

                        const waitTime =
                            attempt * 3000;

                        console.log(
                            `⏳ Waiting ${waitTime / 1000} seconds...`
                        );

                        await new Promise(
                            resolve =>
                                setTimeout(
                                    resolve,
                                    waitTime
                                )
                        );
                    }
                }
            }

            if (!connected) {

                throw (
                    lastError ||
                    new Error(
                        'Unable to connect to database.'
                    )
                );
            }

            // -----------------------------------------
            // SYNCHRONIZE DATABASE
            // -----------------------------------------

            console.log(
                '🔄 Synchronizing database models...'
            );

            await db.sequelize.sync();

            console.log(
                '✅ Database synchronized'
            );

            // -----------------------------------------
            // CHECK MODELS
            // -----------------------------------------

            console.log(
                db.User
                    ? '✅ User model ready'
                    : '⚠️ User model not found'
            );

            console.log(
                db.Product
                    ? '✅ Product model ready'
                    : '⚠️ Product model not found'
            );

            console.log(
                db.Sale
                    ? '✅ Sale model ready'
                    : '⚠️ Sale model not found'
            );

            // -----------------------------------------
            // READY
            // -----------------------------------------

            dbInitialized = true;

            console.log('');
            console.log(
                '========================================'
            );
            console.log(
                '✅ DATABASE READY'
            );
            console.log(
                '========================================'
            );
            console.log('');

            return true;
        })();

    try {

        return await initializationPromise;

    } catch (error) {

        initializationPromise =
            null;

        throw error;
    }
}

// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    try {

        // ---------------------------------------------
        // DATABASE
        // ---------------------------------------------

        await initializeDatabase();

        // ---------------------------------------------
        // EMAIL VERIFICATION
        // ---------------------------------------------

        console.log('');
        console.log(
            '========================================'
        );
        console.log(
            'EMAIL SERVICE STARTUP CHECK'
        );
        console.log(
            '========================================'
        );

        if (!EmailService) {

            console.warn(
                '⚠️ EmailService could not be loaded.'
            );

        } else if (
            typeof EmailService.verifySMTP !==
            'function'
        ) {

            console.warn(
                '⚠️ EmailService.verifySMTP() is missing.'
            );

        } else {

            const emailResult =
                await EmailService.verifySMTP();

            if (
                emailResult.success
            ) {

                console.log(
                    '✅ Email service verified and ready'
                );

            } else {

                console.warn(
                    '⚠️ Email service is not ready'
                );

                console.warn(
                    'Reason:',
                    emailResult.error
                );
            }
        }

        console.log(
            '========================================'
        );

        // ---------------------------------------------
        // START HTTP SERVER
        // ---------------------------------------------

        app.listen(
            PORT,
            () => {

                console.log('');
                console.log(
                    '========================================'
                );

                console.log(
                    `🚀 DukaFasta server running on port ${PORT}`
                );

                console.log(
                    `🌐 API: http://localhost:${PORT}`
                );

                console.log(
                    `❤️ Health: http://localhost:${PORT}/health`
                );

                console.log(
                    `👤 Users: http://localhost:${PORT}/users`
                );

                console.log(
                    `📦 Products: http://localhost:${PORT}/products`
                );

                console.log(
                    `🛒 Sales: http://localhost:${PORT}/sales`
                );

                console.log(
                    `📧 Email: http://localhost:${PORT}/email`
                );

                console.log(
                    `📧 Test Email: http://localhost:${PORT}/email/test?email=your-email@example.com`
                );

                console.log(
                    '========================================'
                );

                console.log('');
            }
        );

    } catch (error) {

        console.error('');
        console.error(
            '========================================'
        );

        console.error(
            '❌ FAILED TO START SERVER'
        );

        console.error(
            '========================================'
        );

        console.error(
            error.message
        );

        console.error('');

        process.exit(1);
    }
}

// =====================================================
// START ONLY WHEN RUN DIRECTLY
// =====================================================

if (
    require.main === module
) {
    startServer();
}

// =====================================================
// EXPORT APP
// =====================================================

module.exports = app;