const { Lead, ActivityLog } = require('../models');
const llmService = require('../services/llmService');
const { Op } = require('sequelize');

/**
 * Lead Controller
 *
 * Handles all lead-related operations:
 * - Creating new applications
 * - Analyzing applications with AI
 * - Managing lead pipeline
 * - Converting to clients
 */

const leadController = {
  /**
   * Create New Lead Application
   * POST /api/v1/leads
   */
  async createLead(req, res) {
    try {
      const leadData = req.body;

      // Create lead
      const lead = await Lead.create(leadData);

      // Auto-analyze if enabled
      if (leadData.autoAnalyze !== false) {
        const analysis = await llmService.analyzeLeadApplication(lead.toJSON());

        if (analysis.success) {
          await lead.update({
            aiSummary: analysis.analysis.summary,
            sentimentScore: analysis.analysis.sentiment,
            fitScore: analysis.analysis.fitScore,
            aiAnalysis: analysis.analysis,
          });
        }
      }

      // Log activity
      await ActivityLog.create({
        entityType: 'Lead',
        entityId: lead.id,
        activityType: 'lead_created',
        title: `New application from ${lead.name}`,
        description: lead.summary?.substring(0, 200),
        isAutomated: false,
        icon: 'user-plus',
        importance: 'High',
      });

      res.status(201).json({
        success: true,
        data: await Lead.findByPk(lead.id),
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get All Leads
   * GET /api/v1/leads
   */
  async getLeads(req, res) {
    try {
      const { stage, priority, search, sortBy = 'createdAt', order = 'DESC', limit = 50 } = req.query;

      const where = {};

      if (stage) where.stage = stage;
      if (priority) where.priority = priority;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { niche: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const leads = await Lead.findAll({
        where,
        order: [[sortBy, order]],
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        data: leads,
        count: leads.length,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Single Lead
   * GET /api/v1/leads/:id
   */
  async getLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findByPk(id, {
        include: [
          {
            model: ActivityLog,
            as: 'activityLogs',
            limit: 20,
            order: [['createdAt', 'DESC']],
          },
        ],
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Update Lead
   * PATCH /api/v1/leads/:id
   */
  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      await lead.update(updates);

      // Log stage changes
      if (updates.stage && updates.stage !== lead.stage) {
        await ActivityLog.create({
          entityType: 'Lead',
          entityId: lead.id,
          activityType: 'stage_changed',
          title: `Stage changed to ${updates.stage}`,
          description: `Lead moved from ${lead.stage} to ${updates.stage}`,
          isAutomated: false,
          icon: 'arrow-right',
          importance: 'Medium',
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Analyze Lead with AI
   * POST /api/v1/leads/:id/analyze
   */
  async analyzeLead(req, res) {
    try {
      const { id } = req.params;
      const { guidelines } = req.body;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      const analysis = await llmService.analyzeLeadApplication(lead.toJSON(), guidelines);

      if (!analysis.success) {
        return res.status(500).json({
          success: false,
          error: 'Analysis failed',
        });
      }

      await lead.update({
        aiSummary: analysis.analysis.summary,
        sentimentScore: analysis.analysis.sentiment,
        fitScore: analysis.analysis.fitScore,
        aiAnalysis: analysis.analysis,
      });

      res.json({
        success: true,
        data: lead,
        analysis: analysis.analysis,
      });
    } catch (error) {
      console.error('Error analyzing lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Delete Lead
   * DELETE /api/v1/leads/:id
   */
  async deleteLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      await lead.destroy();

      res.json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = leadController;
