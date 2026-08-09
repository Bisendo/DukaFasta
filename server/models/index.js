
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

// =====================================================
// PATHS
// =====================================================

// Current directory:
// server/models
const modelsDirectory = __dirname;

// Parent directory:
// server
const serverDirectory = path.join(__dirname, '..');

// Environment file:
// server/.env
const envPath = path.join(serverDirectory, '.env');

// CA certificate:
// server/ca.pem
const caPath = path.join(serverDirectory, 'ca.pem');

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config({
  path: envPath,
  override: true
});

// =====================================================
// DATABASE CONFIGURATION
// =====================================================

console.log('');
console.log('========================================');
console.log('DATABASE CONFIGURATION');
console.log('========================================');

console.log('HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.DB_PORT);
console.log('USER:', process.env.DB_USER);
console.log('DATABASE:', process.env.DB_NAME);

console.log(
  'PASSWORD:',
  process.env.DB_PASSWORD ? 'LOADED' : 'MISSING'
);

console.log('========================================');

// =====================================================
// VALIDATE ENVIRONMENT VARIABLES
// =====================================================

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
      `❌ Missing environment variable: ${variable}`
    );
  }
}

// =====================================================
// VALIDATE DATABASE PORT
// =====================================================

const databasePort = Number(process.env.DB_PORT);

if (!Number.isInteger(databasePort)) {
  throw new Error(
    `❌ Invalid DB_PORT: ${process.env.DB_PORT}`
  );
}

// =====================================================
// CHECK CA CERTIFICATE
// =====================================================

if (!fs.existsSync(caPath)) {
  throw new Error(
    `❌ CA certificate not found:\n${caPath}`
  );
}

console.log('✅ CA certificate found');

// =====================================================
// READ CA CERTIFICATE
// =====================================================

const caCertificate = fs.readFileSync(caPath);

// =====================================================
// CREATE SEQUELIZE CONNECTION
// =====================================================

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,

    port: databasePort,

    dialect: 'mysql',

    dialectOptions: {
      ssl: {
        ca: caCertificate,
        rejectUnauthorized: true
      },

      connectTimeout: 30000
    },

    logging: false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    retry: {
      max: 3
    },

    define: {
      timestamps: true
    }
  }
);

// =====================================================
// DATABASE OBJECT
// =====================================================

const db = {};

const basename = path.basename(__filename);

// =====================================================
// LOAD MODELS
// =====================================================

const modelFiles = fs
  .readdirSync(modelsDirectory)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.endsWith('.js') &&
      !file.endsWith('.test.js')
    );
  });

for (const file of modelFiles) {
  try {
    const modelPath = path.join(
      modelsDirectory,
      file
    );

    const model = require(modelPath)(
      sequelize,
      Sequelize.DataTypes
    );

    if (model && model.name) {
      db[model.name] = model;

      console.log(
        `✅ Model loaded: ${model.name}`
      );
    } else {
      console.warn(
        `⚠️ Model did not return correctly: ${file}`
      );
    }

  } catch (error) {
    console.error(
      `❌ Failed to load model: ${file}`
    );

    console.error(error);

    throw error;
  }
}

// =====================================================
// CHECK REQUIRED MODELS
// =====================================================

const requiredModels = [
  'User',
  'Product',
  'Sale'
];

for (const modelName of requiredModels) {
  if (!db[modelName]) {
    console.warn(
      `⚠️ Model not found: ${modelName}`
    );
  }
}

// =====================================================
// MODEL ASSOCIATIONS
// =====================================================

for (const modelName of Object.keys(db)) {
  const model = db[modelName];

  if (
    model &&
    typeof model.associate === 'function'
  ) {
    try {
      model.associate(db);

      console.log(
        `✅ Association loaded: ${modelName}`
      );

    } catch (error) {
      console.error(
        `❌ Association failed: ${modelName}`
      );

      console.error(error);

      throw error;
    }
  }
}

// =====================================================
// SEQUELIZE OBJECTS
// =====================================================

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// =====================================================
// EXPORT
// =====================================================

module.exports = db;

