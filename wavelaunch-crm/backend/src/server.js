const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection, initDatabase } = require('./config/database');
const routes = require('./routes');
const sheetsService = require('./services/sheetsService');
const launchReadinessService = require('./services/launchReadinessService');
const checklistService = require('./services/checklistService');
const { validateEncryptionSetup } = require('./utils/encryption');

/**
 * Wavelaunch CRM Backend Server
 *
 * Main server configuration and initialization.
 * Handles middleware, routing, and database connection.
 */

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logging

// ==================== ROUTES ====================
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wavelaunch CRM API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
});

// ==================== STARTUP AUTOMATIONS ====================
/**
 * Run Startup Automations
 *
 * Executes automated tasks when server starts:
 * - Sync leads from Google Sheets
 * - Update launch readiness scores
 * - Update checklists
 */
const runStartupAutomations = async () => {
  try {
    console.log('\n🤖 Running startup automations...\n');

    // 1. Google Sheets Sync
    if (process.env.AUTO_SYNC_ON_STARTUP === 'true' && process.env.GOOGLE_SHEET_ID) {
      console.log('📊 Syncing from Google Sheets...');
      try {
        const results = await sheetsService.syncFromSheet(
          process.env.GOOGLE_SHEET_ID,
          process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:Z',
          process.env.AUTO_ANALYZE_NEW_LEADS === 'true'
        );

        if (results.newLeads > 0) {
          console.log(`✓ Imported ${results.newLeads} new leads from Google Sheets`);
        } else {
          console.log('✓ Sheets synced (no new leads)');
        }
      } catch (error) {
        console.warn('⚠ Google Sheets sync failed:', error.message);
        console.warn('  Check your GOOGLE_SHEET_ID and credentials in .env');
      }
    }

    // 2. Update Launch Readiness Scores
    console.log('📊 Updating launch readiness scores...');
    try {
      const readinessResults = await launchReadinessService.updateAllReadinessScores();
      console.log(`✓ Updated ${readinessResults.updated} client readiness scores`);
      if (readinessResults.readyToLaunch > 0) {
        console.log(`  🎉 ${readinessResults.readyToLaunch} client(s) ready to launch!`);
      }
      if (readinessResults.stuck > 0) {
        console.log(`  ⚠ ${readinessResults.stuck} client(s) stuck/need attention`);
      }
    } catch (error) {
      console.warn('⚠ Readiness update failed:', error.message);
    }

    // 3. Update Checklists
    console.log('✅ Updating checklists...');
    try {
      const checklistResults = await checklistService.updateAllChecklists();
      console.log(`✓ Updated ${checklistResults.updated} client checklists`);
    } catch (error) {
      console.warn('⚠ Checklist update failed:', error.message);
    }

    console.log('\n✓ Startup automations complete\n');
  } catch (error) {
    console.error('⚠ Startup automations encountered errors:', error.message);
    // Don't exit - server can still run even if automations fail
  }
};

// ==================== SERVER INITIALIZATION ====================
const startServer = async () => {
  try {
    console.log('\n🚀 Starting Wavelaunch CRM Server...\n');

    // Validate encryption setup (Epic 1, Story 1.4)
    console.log('🔐 Validating credential encryption system...');
    const encryptionValid = validateEncryptionSetup();
    if (!encryptionValid) {
      console.error('❌ Credential encryption setup failed. Check ENCRYPTION_MASTER_KEY in .env');
      console.error('   Generate a secure key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
      process.exit(1);
    }

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database (create tables)
    await initDatabase();

    // Run startup automations
    await runStartupAutomations();

    // Start server
    app.listen(PORT, () => {
      console.log('\n✅ Server is running successfully!\n');
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
