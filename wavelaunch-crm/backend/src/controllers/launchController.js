const launchReadinessService = require('../services/launchReadinessService');
const alertsService = require('../services/alertsService');
const checklistService = require('../services/checklistService');
const sheetsService = require('../services/sheetsService');

/**
 * Launch Controller
 *
 * Handles all pre-launch management endpoints:
 * - Launch readiness scores
 * - Launch dashboard
 * - Alerts and CEO briefing
 * - Checklists
 * - Google Sheets sync
 */

const launchController = {
  /**
   * Get Launch Dashboard
   * GET /api/v1/launch/dashboard
   */
  async getLaunchDashboard(req, res) {
    try {
      const dashboard = await launchReadinessService.getLaunchDashboard();

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      console.error('Error getting launch dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Clients by Readiness
   * GET /api/v1/launch/clients?status=ready|almost|stuck|needs_attention
   */
  async getClientsByReadiness(req, res) {
    try {
      const { status = 'all' } = req.query;
      const clients = await launchReadinessService.getClientsByReadiness(status);

      res.json({
        success: true,
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      console.error('Error getting clients by readiness:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Update All Readiness Scores
   * POST /api/v1/launch/update-scores
   */
  async updateAllScores(req, res) {
    try {
      const results = await launchReadinessService.updateAllReadinessScores();

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error updating scores:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Daily CEO Briefing
   * GET /api/v1/launch/briefing
   */
  async getDailyCEOBriefing(req, res) {
    try {
      const briefing = await alertsService.generateDailyCEOBriefing();

      res.json({
        success: true,
        data: briefing,
      });
    } catch (error) {
      console.error('Error generating briefing:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Alert Summary
   * GET /api/v1/launch/alerts
   */
  async getAlertSummary(req, res) {
    try {
      const summary = await alertsService.getAlertSummary();

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error getting alerts:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Client Checklist
   * GET /api/v1/launch/checklist/:clientId
   */
  async getClientChecklist(req, res) {
    try {
      const { clientId } = req.params;
      const checklist = await checklistService.getClientChecklist(clientId);

      res.json({
        success: true,
        data: checklist,
      });
    } catch (error) {
      console.error('Error getting checklist:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Mark Checklist Item
   * POST /api/v1/launch/checklist/:clientId/:itemId
   */
  async markChecklistItem(req, res) {
    try {
      const { clientId, itemId } = req.params;
      const { completed } = req.body;

      const checklist = await checklistService.markChecklistItem(clientId, itemId, completed);

      res.json({
        success: true,
        data: checklist,
      });
    } catch (error) {
      console.error('Error marking checklist item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get All Checklist Templates
   * GET /api/v1/launch/checklist-templates
   */
  async getChecklistTemplates(req, res) {
    try {
      const templates = checklistService.getAllTemplates();

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Sync from Google Sheets
   * POST /api/v1/launch/sync-sheets
   */
  async syncGoogleSheets(req, res) {
    try {
      const { spreadsheetId, range, autoAnalyze = true } = req.body;

      if (!spreadsheetId) {
        return res.status(400).json({
          success: false,
          error: 'spreadsheetId is required',
        });
      }

      const results = await sheetsService.syncFromSheet(spreadsheetId, range, autoAnalyze);

      res.json({
        success: true,
        data: results,
        message: `Synced ${results.newLeads} new leads`,
      });
    } catch (error) {
      console.error('Error syncing sheets:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Sheets Sync Status
   * GET /api/v1/launch/sync-status
   */
  async getSyncStatus(req, res) {
    try {
      const status = sheetsService.getSyncStatus();

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Error getting sync status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Test Google Sheets Connection
   * POST /api/v1/launch/test-sheets
   */
  async testSheetsConnection(req, res) {
    try {
      const { spreadsheetId } = req.body;

      if (!spreadsheetId) {
        return res.status(400).json({
          success: false,
          error: 'spreadsheetId is required',
        });
      }

      const result = await sheetsService.testConnection(spreadsheetId);

      res.json(result);
    } catch (error) {
      console.error('Error testing connection:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = launchController;
