const aiEnhancementsService = require('../services/aiEnhancementsService');
const { Client } = require('../models');
const fs = require('fs').promises;
const { getDocumentByNumber } = require('../utils/documentTemplates');

/**
 * AI Enhancements Controller
 *
 * Handles AI-powered document enhancements including summarization,
 * quality checks, revision suggestions, and alternative versions.
 */

/**
 * Generate document summary
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/summarize
 */
exports.summarizeDocument = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Get document
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];
    const documentTemplate = getDocumentByNumber(month, doc);
    const documentMeta = monthData?.documents?.find((d) => d.name === documentTemplate.name);

    if (!documentMeta || !documentMeta.filePath) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Read document content
    const markdown = await fs.readFile(documentMeta.filePath, 'utf-8');

    // Generate summary
    const result = await aiEnhancementsService.summarizeDocument(markdown, documentMeta.name);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: result.data,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error('Error summarizing document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Run quality check on document
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/quality-check
 */
exports.qualityCheck = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Get document
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];
    const documentTemplate = getDocumentByNumber(month, doc);
    const documentMeta = monthData?.documents?.find((d) => d.name === documentTemplate.name);

    if (!documentMeta || !documentMeta.filePath) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Read document content
    const markdown = await fs.readFile(documentMeta.filePath, 'utf-8');

    // Run quality check
    const result = await aiEnhancementsService.qualityCheck(markdown, documentMeta.name);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: result.data,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error('Error running quality check:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generate revision suggestions
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/suggest-revisions
 */
exports.suggestRevisions = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const { revisionNotes } = req.body;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    if (!revisionNotes) {
      return res.status(400).json({ success: false, error: 'revisionNotes is required' });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Get document
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];
    const documentTemplate = getDocumentByNumber(month, doc);
    const documentMeta = monthData?.documents?.find((d) => d.name === documentTemplate.name);

    if (!documentMeta || !documentMeta.filePath) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Read document content
    const markdown = await fs.readFile(documentMeta.filePath, 'utf-8');

    // Generate revision suggestions
    const result = await aiEnhancementsService.suggestRevisions(
      markdown,
      documentMeta.name,
      revisionNotes
    );

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: result.data,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error('Error suggesting revisions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Extract key metrics from document
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/extract-metrics
 */
exports.extractMetrics = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Get document
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];
    const documentTemplate = getDocumentByNumber(month, doc);
    const documentMeta = monthData?.documents?.find((d) => d.name === documentTemplate.name);

    if (!documentMeta || !documentMeta.filePath) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Read document content
    const markdown = await fs.readFile(documentMeta.filePath, 'utf-8');

    // Extract metrics
    const result = await aiEnhancementsService.extractKeyMetrics(markdown);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: result.data,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error('Error extracting metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
