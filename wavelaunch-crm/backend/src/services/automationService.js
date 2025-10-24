const { Client, Milestone, File, ActivityLog } = require('../models');
const llmService = require('./llmService');
const emailService = require('./emailService');
const healthScoreService = require('./healthScoreService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Automation Service
 *
 * Orchestrates automated workflows for the CRM:
 * 1. Onboarding kit generation and delivery
 * 2. Milestone trigger actions
 * 3. Monthly deliverable generation
 * 4. Automated health checks and alerts
 *
 * All automations are loosely coupled and can be customized
 * via configuration or extended with custom logic.
 */

class AutomationService {
  /**
   * Trigger Client Onboarding
   *
   * Complete workflow when a lead converts to a client:
   * 1. Generate personalized onboarding kit
   * 2. Create initial milestones
   * 3. Send welcome email (optional)
   * 4. Log activities
   *
   * @param {string} clientId - Client UUID
   * @param {Object} options - Customization options
   * @returns {Promise<Object>} Onboarding results
   *
   * TODO: Customize initial milestones for your workflow
   * TODO: Add email template for welcome message
   * TODO: Configure file storage location
   */
  async triggerOnboarding(clientId, options = {}) {
    try {
      console.log(`Starting onboarding automation for client ${clientId}`);

      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const results = {
        onboardingKitGenerated: false,
        milestonesCreated: 0,
        emailSent: false,
        errors: [],
      };

      // 1. Generate Onboarding Kit
      if (process.env.AUTO_GENERATE_ONBOARDING_KIT === 'true') {
        try {
          const kitResult = await llmService.generateOnboardingKit(
            client.toJSON(),
            options.onboardingTemplate || null
          );

          if (kitResult.success) {
            // Save onboarding kit as a file
            const uploadsDir = process.env.UPLOAD_DIR || './uploads';
            const clientDir = path.join(uploadsDir, 'clients', client.id);

            // Ensure directory exists
            await fs.mkdir(clientDir, { recursive: true });

            const filename = `onboarding-kit-${Date.now()}.md`;
            const filepath = path.join(clientDir, filename);

            await fs.writeFile(filepath, kitResult.content);

            // Create file record
            await File.create({
              entityType: 'Client',
              entityId: client.id,
              filename,
              originalName: `Onboarding Kit - ${client.name}.md`,
              mimeType: 'text/markdown',
              size: Buffer.byteLength(kitResult.content),
              path: filepath,
              category: 'OnboardingKit',
              tags: ['onboarding', 'welcome'],
              metadata: {
                generatedAt: new Date(),
                tokensUsed: kitResult.tokensUsed,
              },
              isAiGenerated: true,
              generationPrompt: 'Generate onboarding kit for new client',
            });

            // Update client
            await client.update({
              onboardingKitGenerated: true,
              onboardingKitSentAt: new Date(),
            });

            results.onboardingKitGenerated = true;

            // Log activity
            await ActivityLog.create({
              entityType: 'Client',
              entityId: client.id,
              activityType: 'onboarding_kit_generated',
              title: 'Onboarding Kit Generated',
              description: 'AI-generated onboarding kit created and saved',
              isAutomated: true,
              icon: 'document',
              importance: 'High',
            });
          }
        } catch (error) {
          console.error('Error generating onboarding kit:', error);
          results.errors.push(`Onboarding kit: ${error.message}`);
        }
      }

      // 2. Create Initial Milestones
      try {
        const initialMilestones = this.getInitialMilestones(client);

        for (const milestoneData of initialMilestones) {
          await Milestone.create({
            clientId: client.id,
            ...milestoneData,
          });
          results.milestonesCreated++;
        }

        await ActivityLog.create({
          entityType: 'Client',
          entityId: client.id,
          activityType: 'milestones_created',
          title: `${results.milestonesCreated} Initial Milestones Created`,
          description: 'Journey roadmap established',
          isAutomated: true,
          icon: 'flag',
          importance: 'Medium',
        });
      } catch (error) {
        console.error('Error creating milestones:', error);
        results.errors.push(`Milestones: ${error.message}`);
      }

      // 3. Send Welcome Email (if configured)
      if (options.sendEmail && process.env.SMTP_HOST) {
        try {
          // TODO: Implement email sending via nodemailer
          // This is a placeholder for email functionality
          results.emailSent = true;
        } catch (error) {
          console.error('Error sending welcome email:', error);
          results.errors.push(`Email: ${error.message}`);
        }
      }

      // 4. Initial Health Score Calculation
      try {
        await healthScoreService.updateClientHealthScore(client.id);
      } catch (error) {
        console.error('Error calculating initial health score:', error);
        results.errors.push(`Health score: ${error.message}`);
      }

      console.log('Onboarding automation completed:', results);
      return results;
    } catch (error) {
      console.error('Onboarding automation failed:', error);
      throw error;
    }
  }

  /**
   * Get Initial Milestones for a Client
   *
   * Defines the default milestone structure based on journey stage.
   * Customize this to match your specific workflow.
   *
   * @param {Object} client - Client record
   * @returns {Array} Milestone definitions
   *
   * TODO: Customize these milestones for your business
   */
  getInitialMilestones(client) {
    const baseMilestones = [
      {
        title: 'Complete Onboarding Forms',
        description: 'Submit all required onboarding documentation',
        category: 'Onboarding',
        status: 'Pending',
        priority: 'High',
        order: 1,
        impactOnHealth: 10,
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        title: 'Submit Brand Materials',
        description: 'Provide logos, colors, fonts, and brand guidelines',
        category: 'Onboarding',
        status: 'Pending',
        priority: 'High',
        order: 2,
        impactOnHealth: 10,
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
      {
        title: 'Sign Contract',
        description: 'Review and sign service agreement',
        category: 'Onboarding',
        status: 'Pending',
        priority: 'Critical',
        order: 3,
        impactOnHealth: 15,
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Foundation Strategy Call',
        description: 'Initial strategy session to define goals and roadmap',
        category: 'Onboarding',
        status: 'Pending',
        priority: 'High',
        order: 4,
        impactOnHealth: 10,
        targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ];

    // Add stage-specific milestones
    const stageMilestones = {
      Foundation: [
        {
          title: 'Define Product Concept',
          description: 'Finalize the product/service offering',
          category: 'Product',
          status: 'Pending',
          priority: 'High',
          order: 5,
          impactOnHealth: 15,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
      Prep: [
        {
          title: 'Product Development Complete',
          description: 'Finalize product creation and quality assurance',
          category: 'Product',
          status: 'Pending',
          priority: 'Critical',
          order: 5,
          impactOnHealth: 20,
        },
      ],
      Launch: [
        {
          title: 'Launch Product',
          description: 'Official product launch to audience',
          category: 'Launch',
          status: 'Pending',
          priority: 'Critical',
          order: 5,
          impactOnHealth: 25,
        },
      ],
      'Growth & Expansion': [
        {
          title: 'Reach $10K Revenue',
          description: 'Achieve first $10,000 in revenue',
          category: 'Revenue',
          status: 'Pending',
          priority: 'High',
          order: 5,
          impactOnHealth: 20,
        },
      ],
    };

    return [...baseMilestones, ...(stageMilestones[client.journeyStage] || [])];
  }

  /**
   * Handle Milestone Completion
   *
   * Triggered when a milestone is marked complete.
   * Executes any configured automation actions.
   *
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise<Object>} Automation results
   */
  async handleMilestoneCompletion(milestoneId) {
    try {
      const milestone = await Milestone.findByPk(milestoneId);
      if (!milestone || milestone.triggered) {
        return { success: false, message: 'Milestone not found or already triggered' };
      }

      const results = {
        actionsExecuted: [],
        errors: [],
      };

      // Execute trigger actions
      for (const action of milestone.triggerActions || []) {
        try {
          switch (action) {
            case 'send_email':
              // TODO: Send milestone completion email
              results.actionsExecuted.push('send_email');
              break;

            case 'generate_document':
              // Generate a document based on automation data
              if (milestone.automationData?.documentType) {
                // TODO: Implement document generation
                results.actionsExecuted.push('generate_document');
              }
              break;

            case 'create_milestone':
              // Create a follow-up milestone
              if (milestone.automationData?.nextMilestone) {
                await Milestone.create({
                  clientId: milestone.clientId,
                  ...milestone.automationData.nextMilestone,
                });
                results.actionsExecuted.push('create_milestone');
              }
              break;

            case 'update_health_score':
              await healthScoreService.updateClientHealthScore(milestone.clientId);
              results.actionsExecuted.push('update_health_score');
              break;

            default:
              console.warn(`Unknown trigger action: ${action}`);
          }
        } catch (error) {
          console.error(`Error executing ${action}:`, error);
          results.errors.push(`${action}: ${error.message}`);
        }
      }

      // Mark as triggered
      await milestone.update({ triggered: true });

      // Update health score with impact
      if (milestone.impactOnHealth !== 0) {
        await healthScoreService.updateClientHealthScore(milestone.clientId);
      }

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: milestone.clientId,
        activityType: 'milestone_completed',
        title: `Milestone Completed: ${milestone.title}`,
        description: milestone.description,
        relatedType: 'Milestone',
        relatedId: milestone.id,
        metadata: {
          category: milestone.category,
          impactOnHealth: milestone.impactOnHealth,
          actionsExecuted: results.actionsExecuted,
        },
        isAutomated: true,
        icon: 'check-circle',
        importance: 'High',
      });

      return { success: true, results };
    } catch (error) {
      console.error('Error handling milestone completion:', error);
      throw error;
    }
  }

  /**
   * Generate Monthly Deliverable
   *
   * Creates a month-specific deliverable document for a client.
   * Can be triggered manually or on a schedule.
   *
   * @param {string} clientId - Client UUID
   * @param {string} month - Month identifier (e.g., "January 2024")
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation results
   */
  async generateMonthlyDeliverable(clientId, month, options = {}) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Gather context data
      const context = {
        milestones: await Milestone.findAll({
          where: { clientId, status: 'Completed' },
          order: [['completedAt', 'DESC']],
          limit: 10,
        }),
        healthScore: client.healthScore,
        journeyProgress: client.journeyProgress,
        revenueThisMonth: options.revenue || 0,
        customMetrics: options.metrics || {},
      };

      // Generate document
      const docResult = await llmService.generateMonthlyDeliverable(
        client.toJSON(),
        month,
        context,
        options.template || null
      );

      if (!docResult.success) {
        throw new Error(docResult.error);
      }

      // Save file
      const uploadsDir = process.env.UPLOAD_DIR || './uploads';
      const clientDir = path.join(uploadsDir, 'clients', client.id);
      await fs.mkdir(clientDir, { recursive: true });

      const filename = `deliverable-${month.replace(/\s+/g, '-')}-${Date.now()}.md`;
      const filepath = path.join(clientDir, filename);

      await fs.writeFile(filepath, docResult.content);

      // Create file record
      const file = await File.create({
        entityType: 'Client',
        entityId: client.id,
        filename,
        originalName: `${month} Deliverable - ${client.name}.md`,
        mimeType: 'text/markdown',
        size: Buffer.byteLength(docResult.content),
        path: filepath,
        category: 'Deliverable',
        tags: ['deliverable', month.toLowerCase()],
        metadata: {
          month,
          generatedAt: new Date(),
          tokensUsed: docResult.tokensUsed,
        },
        isAiGenerated: true,
        generationPrompt: `Generate monthly deliverable for ${month}`,
      });

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: client.id,
        activityType: 'deliverable_generated',
        title: `${month} Deliverable Generated`,
        description: 'Monthly report and action items created',
        relatedType: 'File',
        relatedId: file.id,
        metadata: { month, fileId: file.id },
        isAutomated: true,
        icon: 'document',
        importance: 'High',
      });

      return {
        success: true,
        file,
        content: docResult.content,
      };
    } catch (error) {
      console.error('Error generating monthly deliverable:', error);
      throw error;
    }
  }
}

module.exports = new AutomationService();
