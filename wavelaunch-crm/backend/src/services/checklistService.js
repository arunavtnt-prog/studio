const { Client, Milestone, File, ActivityLog } = require('../models');

/**
 * Pre-Launch Checklist Service
 *
 * Manages stage-specific checklists for creator journey.
 * Tracks what's completed and what's missing at each stage.
 *
 * Checklist Structure:
 * - Foundation: Brand strategy, positioning, audience definition
 * - Prep: Product creation, sales assets, technical setup
 * - Launch: Marketing campaign, launch mechanics, content ready
 *
 * TODO: Customize these checklists for your specific workflow
 */

class ChecklistService {
  /**
   * Get Stage Checklist Template
   *
   * Define what needs to be done at each stage.
   * CUSTOMIZE THIS to match your specific process!
   *
   * @param {string} stage - Journey stage
   * @returns {Array} Checklist items
   */
  getStageChecklistTemplate(stage) {
    const checklists = {
      Foundation: [
        {
          id: 'brand_strategy',
          title: 'Brand Strategy Session Completed',
          description: 'Define vision, mission, and brand positioning',
          category: 'Strategy',
          required: true,
          checkMethod: 'milestone', // Can be: milestone, file, manual
          checkValue: 'Foundation Strategy Call',
        },
        {
          id: 'target_audience',
          title: 'Target Audience Defined',
          description: 'Clear demographic and psychographic profile',
          category: 'Strategy',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'niche_validation',
          title: 'Niche Validated',
          description: 'Market research and competitor analysis complete',
          category: 'Strategy',
          required: true,
          checkMethod: 'file',
          checkValue: 'Brand',
        },
        {
          id: 'offer_defined',
          title: 'Core Offer Defined',
          description: 'Know exactly what product/service you will launch',
          category: 'Product',
          required: true,
          checkMethod: 'milestone',
          checkValue: 'Define Product Concept',
        },
        {
          id: 'brand_identity',
          title: 'Brand Identity Created',
          description: 'Logo, colors, fonts, visual direction',
          category: 'Branding',
          required: true,
          checkMethod: 'file',
          checkValue: 'Brand',
        },
        {
          id: 'contract_signed',
          title: 'Contract Signed',
          description: 'Service agreement executed',
          category: 'Legal',
          required: true,
          checkMethod: 'contract',
        },
      ],

      Prep: [
        {
          id: 'product_created',
          title: 'Product/Service Created',
          description: 'Core offering is complete and ready',
          category: 'Product',
          required: true,
          checkMethod: 'milestone',
          checkValue: 'Product Development Complete',
        },
        {
          id: 'sales_page',
          title: 'Sales Page Live',
          description: 'Landing page with copy and design',
          category: 'Marketing',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'email_sequences',
          title: 'Email Sequences Written',
          description: 'Welcome, nurture, and sales sequences',
          category: 'Marketing',
          required: true,
          checkMethod: 'file',
          checkValue: 'Deliverable',
        },
        {
          id: 'payment_processing',
          title: 'Payment Processing Set Up',
          description: 'Stripe/PayPal configured and tested',
          category: 'Technical',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'fulfillment_system',
          title: 'Fulfillment System Ready',
          description: 'How customers will access/receive the product',
          category: 'Technical',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'launch_content',
          title: 'Launch Content Created',
          description: 'Social posts, videos, graphics for launch week',
          category: 'Marketing',
          required: true,
          checkMethod: 'file',
          checkValue: 'Deliverable',
        },
        {
          id: 'testimonials',
          title: 'Social Proof Collected',
          description: 'Testimonials, case studies, or beta feedback',
          category: 'Marketing',
          required: false,
          checkMethod: 'manual',
        },
      ],

      Launch: [
        {
          id: 'launch_date_set',
          title: 'Launch Date Confirmed',
          description: 'Specific date and time locked in',
          category: 'Planning',
          required: true,
          checkMethod: 'launch_date',
        },
        {
          id: 'waitlist_built',
          title: 'Waitlist/Pre-Launch List Built',
          description: 'Email list of interested prospects',
          category: 'Marketing',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'launch_plan',
          title: 'Launch Marketing Plan Finalized',
          description: 'Day-by-day content and promo schedule',
          category: 'Marketing',
          required: true,
          checkMethod: 'file',
          checkValue: 'Deliverable',
        },
        {
          id: 'final_testing',
          title: 'All Systems Tested',
          description: 'End-to-end customer journey tested',
          category: 'Technical',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'support_ready',
          title: 'Customer Support Ready',
          description: 'FAQ, support email, response templates',
          category: 'Operations',
          required: true,
          checkMethod: 'manual',
        },
        {
          id: 'launch_content_scheduled',
          title: 'Launch Content Scheduled',
          description: 'All posts/emails queued and ready',
          category: 'Marketing',
          required: true,
          checkMethod: 'manual',
        },
      ],
    };

    return checklists[stage] || [];
  }

  /**
   * Check Checklist Item Status
   *
   * Determines if a checklist item is complete based on its check method.
   *
   * @param {Object} item - Checklist item
   * @param {Object} client - Client with related data
   * @returns {boolean} Is complete
   */
  checkItemStatus(item, client) {
    switch (item.checkMethod) {
      case 'milestone':
        // Check if milestone with matching title is completed
        if (!client.milestones) return false;
        return client.milestones.some(
          m => m.title.includes(item.checkValue) && m.status === 'Completed'
        );

      case 'file':
        // Check if file of matching category exists
        if (!client.files) return false;
        return client.files.some(f => f.category === item.checkValue && f.status === 'Active');

      case 'contract':
        // Check contract status
        return client.contractStatus === 'Signed';

      case 'launch_date':
        // Check if launch date is set
        return !!client.expectedLaunchDate;

      case 'manual':
        // Check if manually marked complete (stored in client metadata)
        const manualChecks = client.profileData?.manualChecklist || {};
        return manualChecks[item.id] === true;

      default:
        return false;
    }
  }

  /**
   * Get Client Checklist with Status
   *
   * @param {string} clientId - Client UUID
   * @returns {Promise<Object>} Checklist with completion status
   */
  async getClientChecklist(clientId) {
    try {
      const client = await Client.findByPk(clientId, {
        include: [
          { model: Milestone, as: 'milestones' },
          { model: File, as: 'files' },
        ],
      });

      if (!client) {
        throw new Error('Client not found');
      }

      const stage = client.journeyStage;
      const template = this.getStageChecklistTemplate(stage);

      const checklist = template.map(item => ({
        ...item,
        completed: this.checkItemStatus(item, client),
      }));

      const stats = {
        total: checklist.length,
        completed: checklist.filter(i => i.completed).length,
        required: checklist.filter(i => i.required).length,
        requiredCompleted: checklist.filter(i => i.required && i.completed).length,
      };

      stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      stats.requiredRate = stats.required > 0 ? Math.round((stats.requiredCompleted / stats.required) * 100) : 0;

      return {
        stage,
        checklist,
        stats,
      };
    } catch (error) {
      console.error('Error getting client checklist:', error);
      throw error;
    }
  }

  /**
   * Mark Manual Checklist Item
   *
   * Manually mark an item as complete/incomplete.
   *
   * @param {string} clientId - Client UUID
   * @param {string} itemId - Checklist item ID
   * @param {boolean} completed - Is completed
   * @returns {Promise<Object>} Updated checklist
   */
  async markChecklistItem(clientId, itemId, completed) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const profileData = client.profileData || {};
      const manualChecklist = profileData.manualChecklist || {};
      manualChecklist[itemId] = completed;

      await client.update({
        profileData: {
          ...profileData,
          manualChecklist,
        },
      });

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: clientId,
        activityType: 'checklist_updated',
        title: `Checklist item ${completed ? 'completed' : 'unchecked'}`,
        description: `${itemId}`,
        isAutomated: false,
        icon: 'check-circle',
        importance: 'Medium',
      });

      // Return updated checklist
      return this.getClientChecklist(clientId);
    } catch (error) {
      console.error('Error marking checklist item:', error);
      throw error;
    }
  }

  /**
   * Update All Client Checklists
   *
   * Recalculates checklist progress for all active clients.
   *
   * @returns {Promise<Object>} Update results
   */
  async updateAllChecklists() {
    try {
      const clients = await Client.findAll({
        where: { status: 'Active' },
        include: [
          { model: Milestone, as: 'milestones' },
          { model: File, as: 'files' },
        ],
      });

      console.log(`Updating checklists for ${clients.length} clients...`);

      const results = {
        total: clients.length,
        updated: 0,
      };

      for (const client of clients) {
        try {
          const { stats } = await this.getClientChecklist(client.id);

          // Update client record with checklist progress
          const checklistProgress = client.checklistProgress || {};
          checklistProgress[client.journeyStage] = {
            completed: stats.completed,
            total: stats.total,
            requiredCompleted: stats.requiredCompleted,
            required: stats.required,
          };

          await client.update({ checklistProgress });
          results.updated++;
        } catch (error) {
          console.error(`Failed to update ${client.name}:`, error.message);
        }
      }

      console.log(`✓ Updated ${results.updated} checklists`);
      return results;
    } catch (error) {
      console.error('Error updating all checklists:', error);
      throw error;
    }
  }

  /**
   * Get All Stage Templates
   *
   * Returns checklist templates for all stages.
   *
   * @returns {Object} Templates by stage
   */
  getAllTemplates() {
    return {
      Foundation: this.getStageChecklistTemplate('Foundation'),
      Prep: this.getStageChecklistTemplate('Prep'),
      Launch: this.getStageChecklistTemplate('Launch'),
    };
  }
}

module.exports = new ChecklistService();
