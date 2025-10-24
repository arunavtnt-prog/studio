const express = require('express');
const leadController = require('../controllers/leadController');
const clientController = require('../controllers/clientController');
const launchController = require('../controllers/launchController');

/**
 * API Routes
 *
 * Central routing configuration for all API endpoints.
 * Version: v1
 */

const router = express.Router();

// ==================== LEADS ====================
router.post('/leads', leadController.createLead);
router.get('/leads', leadController.getLeads);
router.get('/leads/:id', leadController.getLead);
router.patch('/leads/:id', leadController.updateLead);
router.delete('/leads/:id', leadController.deleteLead);
router.post('/leads/:id/analyze', leadController.analyzeLead);

// ==================== CLIENTS ====================
router.post('/clients', clientController.createClient);
router.get('/clients', clientController.getClients);
router.get('/clients/:id', clientController.getClient);
router.patch('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);
router.post('/clients/:id/health-score', clientController.updateHealthScore);
router.post('/clients/:id/deliverables', clientController.generateDeliverable);
router.get('/clients/:id/stats', clientController.getClientStats);

// ==================== LAUNCH MANAGEMENT ====================
router.get('/launch/dashboard', launchController.getLaunchDashboard);
router.get('/launch/clients', launchController.getClientsByReadiness);
router.post('/launch/update-scores', launchController.updateAllScores);
router.get('/launch/briefing', launchController.getDailyCEOBriefing);
router.get('/launch/alerts', launchController.getAlertSummary);
router.get('/launch/checklist/:clientId', launchController.getClientChecklist);
router.post('/launch/checklist/:clientId/:itemId', launchController.markChecklistItem);
router.get('/launch/checklist-templates', launchController.getChecklistTemplates);

// ==================== GOOGLE SHEETS SYNC ====================
router.post('/launch/sync-sheets', launchController.syncGoogleSheets);
router.get('/launch/sync-status', launchController.getSyncStatus);
router.post('/launch/test-sheets', launchController.testSheetsConnection);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Wavelaunch CRM API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
