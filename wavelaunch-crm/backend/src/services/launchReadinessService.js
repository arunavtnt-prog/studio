const { Client, Milestone, File, ActivityLog } = require('../models');
const { Op } = require('sequelize');
const { differenceInDays } = require('date-fns');

/**
 * Launch Readiness Service
 *
 * Calculates launch readiness scores and identifies blockers
 * for pre-launch creator management.
 *
 * Readiness Score Components (0-100):
 * - Milestone Completion (40 points)
 * - File/Asset Completion (20 points)
 * - Communication Activity (15 points)
 * - Stage Progress (15 points)
 * - Contract Status (10 points)
 *
 * Identifies:
 * - Clients ready to launch
 * - Clients stuck/blocked
 * - Critical blockers per client
 */

class LaunchReadinessService {
  /**
   * Calculate Launch Readiness Score
   *
   * @param {string} clientId - Client UUID
   * @returns {Promise<Object>} Readiness data
   */
  async calculateLaunchReadiness(clientId) {
    try {
      const client = await Client.findByPk(clientId, {
        include: [
          { model: Milestone, as: 'milestones' },
          { model: File, as: 'files' },
          { model: ActivityLog, as: 'activityLogs', limit: 30 },
        ],
      });

      if (!client) {
        throw new Error('Client not found');
      }

      let score = 0;
      const blockers = [];
      const completedItems = [];
      const missingItems = [];

      // 1. Milestone Completion (40 points)
      const milestones = client.milestones || [];
      const criticalMilestones = milestones.filter(m =>
        ['Critical', 'High'].includes(m.priority) &&
        !['Completed', 'Skipped'].includes(m.status)
      );

      if (milestones.length > 0) {
        const completedCount = milestones.filter(m => m.status === 'Completed').length;
        const milestoneScore = (completedCount / milestones.length) * 40;
        score += milestoneScore;

        completedItems.push({
          category: 'Milestones',
          count: completedCount,
          total: milestones.length,
        });

        if (criticalMilestones.length > 0) {
          blockers.push({
            type: 'milestone',
            severity: 'high',
            message: `${criticalMilestones.length} critical milestone(s) incomplete`,
            details: criticalMilestones.map(m => m.title),
          });
          missingItems.push(...criticalMilestones.map(m => m.title));
        }
      } else {
        blockers.push({
          type: 'milestone',
          severity: 'high',
          message: 'No milestones defined',
          details: [],
        });
      }

      // 2. File/Asset Completion (20 points)
      const files = client.files || [];
      const requiredFileCategories = ['Brand', 'Contract'];
      const foundCategories = new Set(files.map(f => f.category));

      const fileScore = (foundCategories.size / requiredFileCategories.length) * 20;
      score += fileScore;

      completedItems.push({
        category: 'Files',
        count: files.length,
        total: requiredFileCategories.length,
      });

      requiredFileCategories.forEach(category => {
        if (!foundCategories.has(category)) {
          blockers.push({
            type: 'file',
            severity: 'medium',
            message: `Missing ${category} files`,
            details: [],
          });
          missingItems.push(`${category} files`);
        }
      });

      // 3. Communication Activity (15 points)
      const daysSinceLastActivity = client.lastActivityDate
        ? differenceInDays(new Date(), new Date(client.lastActivityDate))
        : 999;

      let activityScore = 0;
      if (daysSinceLastActivity <= 3) activityScore = 15;
      else if (daysSinceLastActivity <= 7) activityScore = 10;
      else if (daysSinceLastActivity <= 14) activityScore = 5;
      else {
        blockers.push({
          type: 'communication',
          severity: 'high',
          message: `No activity in ${daysSinceLastActivity} days`,
          details: ['Client may be unresponsive or stuck'],
        });
      }

      score += activityScore;

      // 4. Stage Progress (15 points)
      const stageScores = {
        Foundation: 5,
        Prep: 10,
        Launch: 15,
        'Growth & Expansion': 15,
      };

      score += stageScores[client.journeyStage] || 0;

      const expectedProgress = {
        Foundation: 25,
        Prep: 60,
        Launch: 90,
        'Growth & Expansion': 100,
      };

      if (client.journeyProgress < expectedProgress[client.journeyStage] - 20) {
        blockers.push({
          type: 'progress',
          severity: 'medium',
          message: `Progress (${client.journeyProgress}%) below expected for ${client.journeyStage} stage`,
          details: [],
        });
      }

      // 5. Contract Status (10 points)
      if (client.contractStatus === 'Signed') {
        score += 10;
      } else {
        const severity = client.contractStatus === 'Pending' ? 'high' : 'medium';
        blockers.push({
          type: 'contract',
          severity,
          message: `Contract not signed (${client.contractStatus})`,
          details: [],
        });
        missingItems.push('Signed contract');
      }

      // Determine readiness status
      let readinessStatus = 'Not Ready';
      if (score >= 90) readinessStatus = 'Ready to Launch';
      else if (score >= 70) readinessStatus = 'Almost Ready';
      else if (score >= 50) readinessStatus = 'In Progress';
      else readinessStatus = 'Needs Attention';

      // Check if stuck
      const daysInStage = client.daysInCurrentStage || 0;
      const isStuck = daysInStage > 14 && score < 50;

      let stuckReason = null;
      if (isStuck) {
        if (daysSinceLastActivity > 7) {
          stuckReason = 'No recent activity';
        } else if (criticalMilestones.length > 2) {
          stuckReason = 'Multiple critical milestones incomplete';
        } else if (client.contractStatus !== 'Signed') {
          stuckReason = 'Contract not signed';
        } else {
          stuckReason = 'Stalled progress';
        }
      }

      return {
        score: Math.round(score),
        readinessStatus,
        blockers,
        completedItems,
        missingItems,
        isStuck,
        stuckReason,
        daysSinceLastActivity,
        criticalMetrics: {
          milestonesCompleted: milestones.filter(m => m.status === 'Completed').length,
          milestonesTotal: milestones.length,
          filesUploaded: files.length,
          contractSigned: client.contractStatus === 'Signed',
          journeyProgress: client.journeyProgress,
        },
      };
    } catch (error) {
      console.error('Error calculating launch readiness:', error);
      throw error;
    }
  }

  /**
   * Update Client Launch Readiness
   *
   * Calculates and persists readiness data to client record.
   *
   * @param {string} clientId - Client UUID
   * @returns {Promise<Object>} Updated readiness data
   */
  async updateClientReadiness(clientId) {
    try {
      const readiness = await this.calculateLaunchReadiness(clientId);

      await Client.update(
        {
          launchReadinessScore: readiness.score,
          launchBlockers: readiness.blockers.map(b => b.message),
          isStuck: readiness.isStuck,
          stuckReason: readiness.stuckReason,
        },
        { where: { id: clientId } }
      );

      return readiness;
    } catch (error) {
      console.error('Error updating client readiness:', error);
      throw error;
    }
  }

  /**
   * Get Clients by Readiness Status
   *
   * @param {string} status - 'ready', 'almost', 'stuck', 'all'
   * @returns {Promise<Array>} Clients matching status
   */
  async getClientsByReadiness(status = 'all') {
    try {
      let where = { status: 'Active' };

      if (status === 'ready') {
        where.launchReadinessScore = { [Op.gte]: 90 };
      } else if (status === 'almost') {
        where.launchReadinessScore = { [Op.between]: [70, 89] };
      } else if (status === 'stuck') {
        where.isStuck = true;
      } else if (status === 'needs_attention') {
        where.launchReadinessScore = { [Op.lt]: 50 };
      }

      const clients = await Client.findAll({
        where,
        include: [
          { model: Milestone, as: 'milestones' },
        ],
        order: [
          ['expectedLaunchDate', 'ASC'],
          ['launchReadinessScore', 'DESC'],
        ],
      });

      return clients;
    } catch (error) {
      console.error('Error getting clients by readiness:', error);
      throw error;
    }
  }

  /**
   * Get Launch Dashboard Data
   *
   * Aggregated data for CEO launch overview.
   *
   * @returns {Promise<Object>} Dashboard data
   */
  async getLaunchDashboard() {
    try {
      const allClients = await Client.findAll({
        where: { status: { [Op.in]: ['Active', 'Paused'] } },
        include: [
          { model: Milestone, as: 'milestones' },
        ],
      });

      const dashboard = {
        totalActive: allClients.length,
        readyToLaunch: allClients.filter(c => c.launchReadinessScore >= 90).length,
        almostReady: allClients.filter(c => c.launchReadinessScore >= 70 && c.launchReadinessScore < 90).length,
        stuck: allClients.filter(c => c.isStuck).length,
        needsAttention: allClients.filter(c => c.launchReadinessScore < 50).length,

        // This week's launches
        launchingThisWeek: allClients.filter(c => {
          if (!c.expectedLaunchDate) return false;
          const daysUntil = differenceInDays(new Date(c.expectedLaunchDate), new Date());
          return daysUntil >= 0 && daysUntil <= 7;
        }).length,

        // Overdue launches
        overdueLaunches: allClients.filter(c => {
          if (!c.expectedLaunchDate) return false;
          const daysUntil = differenceInDays(new Date(c.expectedLaunchDate), new Date());
          return daysUntil < 0 && !c.actualLaunchDate;
        }).length,

        // Average readiness by stage
        readinessByStage: {},
      };

      // Calculate average readiness per stage
      const stages = ['Foundation', 'Prep', 'Launch'];
      stages.forEach(stage => {
        const stageClients = allClients.filter(c => c.journeyStage === stage);
        if (stageClients.length > 0) {
          const avgScore = stageClients.reduce((sum, c) => sum + (c.launchReadinessScore || 0), 0) / stageClients.length;
          dashboard.readinessByStage[stage] = {
            count: stageClients.length,
            avgReadiness: Math.round(avgScore),
          };
        }
      });

      return dashboard;
    } catch (error) {
      console.error('Error getting launch dashboard:', error);
      throw error;
    }
  }

  /**
   * Update All Client Readiness Scores
   *
   * Background job to recalculate all active clients.
   *
   * @returns {Promise<Object>} Update results
   */
  async updateAllReadinessScores() {
    try {
      const clients = await Client.findAll({
        where: { status: 'Active' },
      });

      console.log(`Updating readiness scores for ${clients.length} clients...`);

      const results = {
        total: clients.length,
        updated: 0,
        failed: 0,
        readyToLaunch: 0,
        stuck: 0,
      };

      for (const client of clients) {
        try {
          const readiness = await this.updateClientReadiness(client.id);
          results.updated++;

          if (readiness.score >= 90) results.readyToLaunch++;
          if (readiness.isStuck) results.stuck++;

        } catch (error) {
          console.error(`Failed to update ${client.name}:`, error.message);
          results.failed++;
        }
      }

      console.log('Readiness update completed:', results);
      return results;
    } catch (error) {
      console.error('Error updating all readiness scores:', error);
      throw error;
    }
  }
}

module.exports = new LaunchReadinessService();
