const express = require('express');
const multer = require('multer');
const leadController = require('../controllers/leadController');
const clientController = require('../controllers/clientController');
const launchController = require('../controllers/launchController');
const onboardingKitController = require('../controllers/onboardingKitController');
const businessPlanController = require('../controllers/businessPlanController');
const pdfController = require('../controllers/pdfController');

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
