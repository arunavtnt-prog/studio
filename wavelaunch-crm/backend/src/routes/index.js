const express = require('express');
const multer = require('multer');
const leadController = require('../controllers/leadController');
const clientController = require('../controllers/clientController');
const credentialController = require('../controllers/credentialController');
const launchController = require('../controllers/launchController');
const onboardingKitController = require('../controllers/onboardingKitController');
const businessPlanController = require('../controllers/businessPlanController');
const pdfController = require('../controllers/pdfController');
const analyticsController = require('../controllers/analyticsController');
const aiEnhancementsController = require('../controllers/aiEnhancementsController');
const exportController = require('../controllers/exportController');
const webhookController = require('../controllers/webhookController');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  },
});

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

// ==================== CREDENTIALS (Epic 1, Story 1.4) ====================
// Create credential
router.post('/credentials', credentialController.createCredential);
router.post('/clients/:clientId/credentials', credentialController.createCredential);

// Get credentials
router.get('/clients/:clientId/credentials', credentialController.getClientCredentials);
router.get('/credentials/:id', credentialController.getCredential);
router.get('/credentials/attention', credentialController.getCredentialsNeedingAttention);

// Reveal credential (decrypt for copy)
router.post('/credentials/:id/reveal', credentialController.revealCredential);

// Update & delete
router.patch('/credentials/:id', credentialController.updateCredential);
router.delete('/credentials/:id', credentialController.deleteCredential);

// Verify credential
router.post('/credentials/:id/verify', credentialController.verifyCredential);

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

// ==================== ONBOARDING KIT (8-MONTH PROGRAM) ====================
// Generate documents
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/generate', onboardingKitController.generateMonthDocuments);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/generate', onboardingKitController.generateSingleDocument);

// Get documents
router.get('/clients/:clientId/onboarding-kit/progress', onboardingKitController.getOnboardingProgress);
router.get('/clients/:clientId/onboarding-kit/month/:monthNumber', onboardingKitController.getMonthDocuments);
router.get('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber', onboardingKitController.getSingleDocument);

// Update document status
router.put('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/status', onboardingKitController.updateDocumentStatus);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/revision', onboardingKitController.requestRevision);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/approve', onboardingKitController.approveDocument);

// Month completion
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/complete', onboardingKitController.completeMonth);

// PDF Generation
router.get('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/pdf', pdfController.generateDocumentPDF);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/generate-pdfs', pdfController.generateMonthPDFs);

// ==================== BUSINESS PLAN UPLOAD ====================
router.post('/clients/:clientId/business-plan/upload', upload.single('businessPlan'), businessPlanController.uploadBusinessPlan);
router.get('/clients/:clientId/business-plan', businessPlanController.getBusinessPlan);
router.delete('/clients/:clientId/business-plan', businessPlanController.deleteBusinessPlan);

// ==================== ANALYTICS ====================
router.get('/analytics/overview', analyticsController.getOverviewAnalytics);
router.get('/analytics/client/:clientId', analyticsController.getClientAnalytics);
router.get('/analytics/document-performance', analyticsController.getDocumentPerformance);
router.post('/analytics/track', analyticsController.trackEvent);
router.get('/analytics/export', exportController.exportAllClientsAnalytics);

// ==================== AI ENHANCEMENTS ====================
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/summarize', aiEnhancementsController.summarizeDocument);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/quality-check', aiEnhancementsController.qualityCheck);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/suggest-revisions', aiEnhancementsController.suggestRevisions);
router.post('/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/extract-metrics', aiEnhancementsController.extractMetrics);

// ==================== DATA EXPORT ====================
router.get('/clients/:clientId/export/:format', exportController.exportClientData);

// ==================== WEBHOOKS ====================
router.post('/clients/:clientId/webhooks', webhookController.registerWebhook);
router.get('/clients/:clientId/webhooks', webhookController.getWebhooks);
router.delete('/clients/:clientId/webhooks/:webhookId', webhookController.deleteWebhook);
router.post('/clients/:clientId/webhooks/:webhookId/test', webhookController.testWebhook);

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
