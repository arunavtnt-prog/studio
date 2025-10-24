const { Client, Lead, File, Email, Milestone, HealthScoreLog, ActivityLog } = require('../models');
const automationService = require('../services/automationService');
const healthScoreService = require('../services/healthScoreService');
const { Op } = require('sequelize');

/**
 * Client Controller
 *
 * Manages all client (onboarded creator) operations:
 * - Client CRUD
 * - Onboarding workflow
 * - Journey progression
 * - Complete client profiles with related data
 */

const clientController = {
  /**
   * Create New Client (or Convert from Lead)
   * POST /api/v1/clients
   */
  async createClient(req, res) {
    try {
      const { leadId, autoOnboard = true, ...clientData } = req.body;

      // If converting from lead, get lead data
      let lead = null;
      if (leadId) {
        lead = await Lead.findByPk(leadId);
        if (lead) {
          // Merge lead data
          clientData.leadId = leadId;
          clientData.name = clientData.name || lead.name;
          clientData.email = clientData.email || lead.email;
          clientData.phone = clientData.phone || lead.phone;
          clientData.socials = clientData.socials || lead.socials;
          clientData.profileData = {
            niche: lead.niche,
            followers: lead.followers,
            engagement: lead.engagement,
            ...clientData.profileData,
          };

          // Update lead status
          await lead.update({
            stage: 'Onboarded',
            onboardedAt: new Date(),
          });
        }
      }

      // Create client
      const client = await Client.create(clientData);

      // Trigger onboarding automation
      if (autoOnboard) {
        await automationService.triggerOnboarding(client.id, req.body.onboardingOptions || {});
      }

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: client.id,
        activityType: 'client_created',
        title: `${client.name} onboarded as client`,
        description: leadId ? 'Converted from lead' : 'Created directly',
        metadata: { leadId, autoOnboard },
        isAutomated: false,
        icon: 'user-check',
        importance: 'High',
      });

      res.status(201).json({
        success: true,
        data: await Client.findByPk(client.id),
      });
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get All Clients
   * GET /api/v1/clients
   */
  async getClients(req, res) {
    try {
      const {
        status,
        healthStatus,
        journeyStage,
        search,
        sortBy = 'createdAt',
        order = 'DESC',
        limit = 50,
      } = req.query;

      const where = {};

      if (status) where.status = status;
      if (healthStatus) where.healthStatus = healthStatus;
      if (journeyStage) where.journeyStage = journeyStage;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const clients = await Client.findAll({
        where,
        order: [[sortBy, order]],
        limit: parseInt(limit),
        include: [
          {
            model: Milestone,
            as: 'milestones',
            attributes: ['id', 'title', 'status', 'category'],
          },
        ],
      });

      res.json({
        success: true,
        data: clients,
        count: clients.length,
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Single Client (Full Profile)
   * GET /api/v1/clients/:id
   */
  async getClient(req, res) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id, {
        include: [
          {
            model: File,
            as: 'files',
            where: { status: 'Active' },
            required: false,
            order: [['createdAt', 'DESC']],
          },
          {
            model: Email,
            as: 'emails',
            limit: 20,
            order: [['date', 'DESC']],
            required: false,
          },
          {
            model: Milestone,
            as: 'milestones',
            order: [['order', 'ASC']],
            required: false,
          },
          {
            model: HealthScoreLog,
            as: 'healthScoreLogs',
            limit: 10,
            order: [['createdAt', 'DESC']],
            required: false,
          },
          {
            model: ActivityLog,
            as: 'activityLogs',
            limit: 30,
            order: [['createdAt', 'DESC']],
            required: false,
          },
          {
            model: Lead,
            as: 'lead',
            required: false,
          },
        ],
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Update Client
   * PATCH /api/v1/clients/:id
   */
  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      const previousStage = client.journeyStage;
      const previousProgress = client.journeyProgress;

      await client.update(updates);

      // Log significant changes
      if (updates.journeyStage && updates.journeyStage !== previousStage) {
        await ActivityLog.create({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'stage_changed',
          title: `Journey stage: ${updates.journeyStage}`,
          description: `Progressed from ${previousStage} to ${updates.journeyStage}`,
          metadata: { previousStage, newStage: updates.journeyStage },
          isAutomated: false,
          icon: 'arrow-up',
          importance: 'High',
        });
      }

      if (updates.journeyProgress && updates.journeyProgress !== previousProgress) {
        await ActivityLog.create({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'progress_updated',
          title: `Progress: ${updates.journeyProgress}%`,
          description: `Journey progress updated`,
          metadata: { previousProgress, newProgress: updates.journeyProgress },
          isAutomated: false,
          icon: 'trending-up',
          importance: 'Medium',
        });
      }

      // Recalculate health score if relevant fields changed
      if (updates.projectStatus || updates.contractStatus || updates.journeyProgress) {
        await healthScoreService.updateClientHealthScore(client.id);
      }

      res.json({
        success: true,
        data: await Client.findByPk(id),
      });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Update Health Score
   * POST /api/v1/clients/:id/health-score
   */
  async updateHealthScore(req, res) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      const healthData = await healthScoreService.updateClientHealthScore(id);

      res.json({
        success: true,
        data: healthData,
      });
    } catch (error) {
      console.error('Error updating health score:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Generate Monthly Deliverable
   * POST /api/v1/clients/:id/deliverables
   */
  async generateDeliverable(req, res) {
    try {
      const { id } = req.params;
      const { month, template, metrics } = req.body;

      if (!month) {
        return res.status(400).json({
          success: false,
          error: 'Month is required',
        });
      }

      const result = await automationService.generateMonthlyDeliverable(id, month, {
        template,
        metrics,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error generating deliverable:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Client Statistics
   * GET /api/v1/clients/:id/stats
   */
  async getClientStats(req, res) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      const [
        totalFiles,
        totalEmails,
        totalMilestones,
        completedMilestones,
        recentActivities,
      ] = await Promise.all([
        File.count({ where: { entityType: 'Client', entityId: id, status: 'Active' } }),
        Email.count({ where: { clientId: id } }),
        Milestone.count({ where: { clientId: id } }),
        Milestone.count({ where: { clientId: id, status: 'Completed' } }),
        ActivityLog.count({
          where: {
            entityType: 'Client',
            entityId: id,
            createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      const stats = {
        files: totalFiles,
        emails: totalEmails,
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          completionRate:
            totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
        },
        recentActivities,
        daysAsClient: Math.floor(
          (new Date() - new Date(client.onboardedAt)) / (1000 * 60 * 60 * 24)
        ),
        healthScore: client.healthScore,
        healthStatus: client.healthStatus,
        journeyProgress: client.journeyProgress,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching client stats:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Delete Client
   * DELETE /api/v1/clients/:id
   */
  async deleteClient(req, res) {
    try {
      const { id } = req.params;

      const client = await Client.findByPk(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      await client.destroy();

      res.json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = clientController;
