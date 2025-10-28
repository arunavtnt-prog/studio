const { Client, Lead, File, Email, Milestone, HealthScoreLog, ActivityLog, Credential } = require('../models');
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
   *
   * Epic 1, Story 1.3: Add Creator/Brand
   * AC1: Full form for all fields
   * AC2: Status 'Onboarding' default (journeyStage: 'Month 1 - Foundation Excellence')
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
   *
   * Epic 1, Story 1.1: View creator brand list
   * AC1: Show Creator/Brand/Journey Status/Health Score
   * AC2: Filter by status
   * AC3: Links to Profile
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
   *
   * Epic 1, Story 1.2: View Creator Profile
   * AC1: Sections: Creator, Brand, Ops Links, Comm History
   * AC2: Status & Health at top
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
          {
            model: Credential,
            as: 'credentials',
            attributes: ['id', 'platform', 'platformCategory', 'accountIdentifier', 'status', 'priority', 'loginUrl', 'lastAccessedAt', 'createdAt'],
            order: [['priority', 'DESC'], ['platform', 'ASC']],
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
   *
   * Epic 1, Story 1.5: Edit Creator Profile fields
   * AC1: All fields editable
   * AC2: Audit log for sensitive changes
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

      // Track previous values for sensitive fields
      const previousValues = {
        journeyStage: client.journeyStage,
        journeyProgress: client.journeyProgress,
        status: client.status,
        healthStatus: client.healthStatus,
        contractStatus: client.contractStatus,
        revenue: client.revenue,
        monthlyRecurring: client.monthlyRecurring,
        email: client.email,
        phone: client.phone,
        assignedTo: client.assignedTo,
        expectedLaunchDate: client.expectedLaunchDate,
      };

      await client.update(updates);

      // Epic 1, Story 1.5, AC2: Comprehensive audit logging for sensitive changes
      const auditLogs = [];

      // Journey Stage Changes
      if (updates.journeyStage && updates.journeyStage !== previousValues.journeyStage) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'stage_changed',
          title: `Journey stage: ${updates.journeyStage}`,
          description: `Progressed from ${previousValues.journeyStage} to ${updates.journeyStage}`,
          metadata: { previousStage: previousValues.journeyStage, newStage: updates.journeyStage },
          isAutomated: false,
          icon: 'arrow-up',
          importance: 'High',
        });
      }

      // Progress Updates
      if (updates.journeyProgress !== undefined && updates.journeyProgress !== previousValues.journeyProgress) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'progress_updated',
          title: `Progress: ${updates.journeyProgress}%`,
          description: `Journey progress updated from ${previousValues.journeyProgress}% to ${updates.journeyProgress}%`,
          metadata: { previousProgress: previousValues.journeyProgress, newProgress: updates.journeyProgress },
          isAutomated: false,
          icon: 'trending-up',
          importance: 'Medium',
        });
      }

      // Status Changes
      if (updates.status && updates.status !== previousValues.status) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'status_changed',
          title: `Status changed to ${updates.status}`,
          description: `Client status updated from ${previousValues.status} to ${updates.status}`,
          metadata: { previousStatus: previousValues.status, newStatus: updates.status },
          isAutomated: false,
          icon: 'flag',
          importance: 'High',
        });
      }

      // Health Status Changes
      if (updates.healthStatus && updates.healthStatus !== previousValues.healthStatus) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'health_status_changed',
          title: `Health: ${updates.healthStatus}`,
          description: `Health status changed from ${previousValues.healthStatus} to ${updates.healthStatus}`,
          metadata: { previousHealth: previousValues.healthStatus, newHealth: updates.healthStatus },
          isAutomated: false,
          icon: updates.healthStatus === 'Green' ? 'check-circle' : updates.healthStatus === 'Yellow' ? 'exclamation-circle' : 'x-circle',
          importance: 'High',
        });
      }

      // Contract Status Changes
      if (updates.contractStatus && updates.contractStatus !== previousValues.contractStatus) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'contract_status_changed',
          title: `Contract: ${updates.contractStatus}`,
          description: `Contract status changed from ${previousValues.contractStatus} to ${updates.contractStatus}`,
          metadata: { previousStatus: previousValues.contractStatus, newStatus: updates.contractStatus },
          isAutomated: false,
          icon: 'document',
          importance: 'High',
        });
      }

      // Revenue Changes (Sensitive Financial Data)
      if (updates.revenue !== undefined && updates.revenue !== previousValues.revenue) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'revenue_updated',
          title: 'Revenue updated',
          description: `Total revenue changed from $${previousValues.revenue} to $${updates.revenue}`,
          metadata: { previousRevenue: previousValues.revenue, newRevenue: updates.revenue },
          isAutomated: false,
          icon: 'currency-dollar',
          importance: 'Medium',
        });
      }

      // Monthly Recurring Revenue Changes
      if (updates.monthlyRecurring !== undefined && updates.monthlyRecurring !== previousValues.monthlyRecurring) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'mrr_updated',
          title: 'MRR updated',
          description: `Monthly recurring revenue changed from $${previousValues.monthlyRecurring} to $${updates.monthlyRecurring}`,
          metadata: { previousMRR: previousValues.monthlyRecurring, newMRR: updates.monthlyRecurring },
          isAutomated: false,
          icon: 'currency-dollar',
          importance: 'Medium',
        });
      }

      // Contact Information Changes (Sensitive PII)
      if (updates.email && updates.email !== previousValues.email) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'email_changed',
          title: 'Email address updated',
          description: `Email changed from ${previousValues.email} to ${updates.email}`,
          metadata: { previousEmail: previousValues.email, newEmail: updates.email },
          isAutomated: false,
          icon: 'mail',
          importance: 'High',
        });
      }

      if (updates.phone && updates.phone !== previousValues.phone) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'phone_changed',
          title: 'Phone number updated',
          description: `Phone changed`,
          metadata: { changed: true },
          isAutomated: false,
          icon: 'phone',
          importance: 'Medium',
        });
      }

      // Assignment Changes
      if (updates.assignedTo && updates.assignedTo !== previousValues.assignedTo) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'assignment_changed',
          title: 'Account manager changed',
          description: `Client reassigned`,
          metadata: { previousAssignedTo: previousValues.assignedTo, newAssignedTo: updates.assignedTo },
          isAutomated: false,
          icon: 'user-group',
          importance: 'High',
        });
      }

      // Launch Date Changes
      if (updates.expectedLaunchDate && updates.expectedLaunchDate !== previousValues.expectedLaunchDate) {
        auditLogs.push({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'launch_date_changed',
          title: 'Expected launch date updated',
          description: `Launch date changed`,
          metadata: { previousDate: previousValues.expectedLaunchDate, newDate: updates.expectedLaunchDate },
          isAutomated: false,
          icon: 'calendar',
          importance: 'High',
        });
      }

      // Bulk create all audit logs
      if (auditLogs.length > 0) {
        await ActivityLog.bulkCreate(auditLogs);
      }

      // Recalculate health score if relevant fields changed
      if (updates.projectStatus || updates.contractStatus || updates.journeyProgress || updates.status) {
        await healthScoreService.updateClientHealthScore(client.id);
      }

      res.json({
        success: true,
        data: await Client.findByPk(id),
        auditLogsCreated: auditLogs.length,
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
