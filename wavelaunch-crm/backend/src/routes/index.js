const express = require('express');
const leadController = require('../controllers/leadController');
const clientController = require('../controllers/clientController');

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
