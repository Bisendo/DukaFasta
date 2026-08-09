'use strict';

// =====================================================
// ENVIRONMENT
// =====================================================

const path = require('path');
const dotenv = require('dotenv');

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
console.log(
    'DB PASSWORD:',
    process.env.DB_PASSWORD ? 'LOADED' : 'MISSING'
);
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
        credentials: true
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
// EMAIL
// -----------------------------------------------------

try {
    const emailRoutes = require('./routes/emailroutes');

    app.use('/email', emailRoutes);

    console.log('✅ Email routes loaded');
} catch (error) {
    console.error(
        '❌ Failed to load email routes:',
        error.message
    );
}

// -----------------------------------------------------
// USERS
// -----------------------------------------------------
//
// This uses the same Users router.
// If your Users.js contains both authentication
// and user-management endpoints, this is okay.
//
// If you have a separate UserManagement.js file,
// change this route to that file.
//

try {
    const userManagementRoutes =
        require('./routes/Users');

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
            health: '/health'
        }
    });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', async (req, res) => {
    try {
        await db.sequelize.authenticate();

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
                email: 'configured'
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
        path: req.originalUrl
    });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            '❌ Server error:',
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
                'Internal server error'
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

        for (const variable of requiredVariables) {

            if (!process.env[variable]) {

                throw new Error(
                    `Missing environment variable: ${variable}`
                );
            }
        }

        console.log('✅ Database environment variables found');

        // -------------------------------------------------
        // DATABASE CONNECTION WITH RETRIES
        // -------------------------------------------------

        const maxAttempts = 5;

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

                if (attempt < maxAttempts) {

                    const waitTime =
                        attempt * 3000;

                    console.log(
                        `⏳ Waiting ${waitTime / 1000} seconds before retry...`
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

        console.log(
            '🔄 Synchronizing database models...'
        );

        await db.sequelize.sync();

        console.log(
            '✅ Database synchronized'
        );

        // -------------------------------------------------
        // CHECK MODELS
        // -------------------------------------------------

        if (db.User) {
            console.log(
                '✅ User model ready'
            );
        } else {
            console.warn(
                '⚠️ User model not found'
            );
        }

        if (db.Product) {
            console.log(
                '✅ Product model ready'
            );
        } else {
            console.warn(
                '⚠️ Product model not found'
            );
        }

        if (db.Sale) {
            console.log(
                '✅ Sale model ready'
            );
        } else {
            console.warn(
                '⚠️ Sale model not found'
            );
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
// LOCAL SERVER
// =====================================================

if (require.main === module) {

    initializeDatabase()
        .then(() => {

            app.listen(
                PORT,
                () => {

                    console.log('');
                    console.log(
                        '========================================'
                    );

                    console.log(
                        `🚀 Server running on port ${PORT}`
                    );

                    console.log(
                        `🌐 API: http://localhost:${PORT}`
                    );

                    console.log(
                        `❤️ Health: http://localhost:${PORT}/health`
                    );

                    console.log(
                        '========================================'
                    );
                    console.log('');
                }
            );
        })
        .catch(error => {

            console.error('');
            console.error(
                '❌ Failed to start server'
            );

            console.error(
                error.message
            );

            process.exit(1);
        });
}

// =====================================================
// EXPORT FOR VERCEL / OTHER HOSTING
// =====================================================

module.exports = app;
