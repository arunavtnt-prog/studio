const { Client, Email, Milestone, HealthScoreLog, ActivityLog } = require('../models');
const { Op } = require('sequelize');
const { subDays, differenceInDays } = require('date-fns');

/**
 * Health Score Service
 *
 * Calculates and maintains health scores for clients.
 * Health score is a composite metric (0-100) based on:
 *
 * 1. Email Activity (25%) - Communication frequency and recency
 * 2. Milestone Progress (30%) - Completion of key objectives
 * 3. General Activity (25%) - Engagement with platform
 * 4. Project Progress (20%) - Movement through journey stages
 *
 * Scoring Thresholds:
 * - Green: 80-100 (Healthy)
 * - Yellow: 50-79 (Needs Attention)
 * - Red: 0-49 (At Risk)
 *
 * CUSTOMIZATION:
 * - Adjust weights in .env (HEALTH_SCORE_*_WEIGHT)
 * - Modify scoring logic in each component function
 * - Add custom flags and rules
 */

class HealthScoreService {
  constructor() {
    // Weights (sum should equal 1.0)
    this.weights = {
      email: parseFloat(process.env.HEALTH_SCORE_EMAIL_WEIGHT) || 0.25,
      milestone: parseFloat(process.env.HEALTH_SCORE_MILESTONE_WEIGHT) || 0.3,
      activity: parseFloat(process.env.HEALTH_SCORE_ACTIVITY_WEIGHT) || 0.25,
      progress: parseFloat(process.env.HEALTH_SCORE_PROGRESS_WEIGHT) || 0.2,
    };
  }

  /**
   * Calculate Email Activity Score (0-100)
   *
   * Factors:
   * - Days since last email (recency)
   * - Number of emails in last 30 days (frequency)
   * - Average sentiment of recent emails
   *
   * @param {Object} client - Client record
   * @returns {Promise<Object>} Score and details
   */
  async calculateEmailScore(client) {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const sevenDaysAgo = subDays(new Date(), 7);

      // Get recent emails
      const recentEmails = await Email.findAll({
        where: {
          clientId: client.id,
          date: { [Op.gte]: thirtyDaysAgo },
        },
        order: [['date', 'DESC']],
      });

      let score = 0;
      const details = {
        recentEmailCount: recentEmails.length,
        daysSinceLastEmail: null,
        avgSentiment: null,
        flags: [],
      };

      // Recency score (40 points max)
      if (client.lastEmailDate) {
        const daysSince = differenceInDays(new Date(), new Date(client.lastEmailDate));
        details.daysSinceLastEmail = daysSince;

        if (daysSince <= 3) score += 40;
        else if (daysSince <= 7) score += 30;
        else if (daysSince <= 14) score += 20;
        else if (daysSince <= 30) score += 10;
        else details.flags.push('no_recent_email');
      } else {
        details.flags.push('no_emails_ever');
      }

      // Frequency score (40 points max)
      const emailCount = recentEmails.length;
      if (emailCount >= 15) score += 40;
      else if (emailCount >= 10) score += 30;
      else if (emailCount >= 5) score += 20;
      else if (emailCount >= 2) score += 10;
      else details.flags.push('low_email_frequency');

      // Sentiment score (20 points max)
      const emailsWithSentiment = recentEmails.filter((e) => e.sentiment !== null);
      if (emailsWithSentiment.length > 0) {
        const avgSentiment =
          emailsWithSentiment.reduce((sum, e) => sum + e.sentiment, 0) /
          emailsWithSentiment.length;

        details.avgSentiment = avgSentiment;

        if (avgSentiment >= 0.7) score += 20;
        else if (avgSentiment >= 0.5) score += 15;
        else if (avgSentiment >= 0.3) score += 5;
        else details.flags.push('negative_sentiment');
      }

      return { score: Math.min(100, score), details };
    } catch (error) {
      console.error('Error calculating email score:', error);
      return { score: 50, details: { error: error.message } };
    }
  }

  /**
   * Calculate Milestone Completion Score (0-100)
   *
   * Factors:
   * - Percentage of completed milestones
   * - Number of overdue milestones
   * - Recent milestone completions
   *
   * @param {Object} client - Client record
   * @returns {Promise<Object>} Score and details
   */
  async calculateMilestoneScore(client) {
    try {
      const milestones = await Milestone.findAll({
        where: { clientId: client.id },
      });

      let score = 50; // Base score
      const details = {
        total: milestones.length,
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0,
        flags: [],
      };

      if (milestones.length === 0) {
        details.flags.push('no_milestones_defined');
        return { score: 50, details };
      }

      // Count statuses
      const now = new Date();
      milestones.forEach((m) => {
        if (m.status === 'Completed') details.completed++;
        else if (m.status === 'In Progress') details.inProgress++;
        else if (m.status === 'Pending') details.pending++;

        // Check for overdue
        if (m.targetDate && new Date(m.targetDate) < now && m.status !== 'Completed') {
          details.overdue++;
        }
      });

      details.completionRate = (details.completed / details.total) * 100;

      // Completion rate score (60 points max)
      if (details.completionRate >= 80) score = 90;
      else if (details.completionRate >= 60) score = 75;
      else if (details.completionRate >= 40) score = 60;
      else if (details.completionRate >= 20) score = 45;
      else score = 30;

      // Penalty for overdue milestones
      if (details.overdue > 0) {
        score -= details.overdue * 10;
        details.flags.push('overdue_milestones');
      }

      // Bonus for recent completions
      const sevenDaysAgo = subDays(new Date(), 7);
      const recentCompletions = milestones.filter(
        (m) => m.completedAt && new Date(m.completedAt) >= sevenDaysAgo
      );

      if (recentCompletions.length > 0) {
        score += Math.min(10, recentCompletions.length * 5);
      }

      return { score: Math.max(0, Math.min(100, score)), details };
    } catch (error) {
      console.error('Error calculating milestone score:', error);
      return { score: 50, details: { error: error.message } };
    }
  }

  /**
   * Calculate General Activity Score (0-100)
   *
   * Factors:
   * - File uploads
   * - Last touchpoint date
   * - Contract status
   * - Response to communications
   *
   * @param {Object} client - Client record
   * @returns {Promise<Object>} Score and details
   */
  async calculateActivityScore(client) {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Get recent activities
      const recentActivities = await ActivityLog.findAll({
        where: {
          entityType: 'Client',
          entityId: client.id,
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
      });

      let score = 0;
      const details = {
        recentActivityCount: recentActivities.length,
        daysSinceLastTouchpoint: null,
        contractStatus: client.contractStatus,
        flags: [],
      };

      // Touchpoint recency (40 points max)
      if (client.lastTouchpoint) {
        const daysSince = differenceInDays(new Date(), new Date(client.lastTouchpoint));
        details.daysSinceLastTouchpoint = daysSince;

        if (daysSince <= 3) score += 40;
        else if (daysSince <= 7) score += 30;
        else if (daysSince <= 14) score += 20;
        else if (daysSince <= 21) score += 10;
        else details.flags.push('stale_touchpoint');
      } else {
        details.flags.push('no_touchpoint_recorded');
      }

      // Activity frequency (40 points max)
      const activityCount = recentActivities.length;
      if (activityCount >= 20) score += 40;
      else if (activityCount >= 15) score += 30;
      else if (activityCount >= 10) score += 20;
      else if (activityCount >= 5) score += 10;
      else details.flags.push('low_activity');

      // Contract status (20 points max)
      if (client.contractStatus === 'Signed') score += 20;
      else if (client.contractStatus === 'Sent') score += 10;
      else if (client.contractStatus === 'Pending') details.flags.push('contract_pending');
      else if (client.contractStatus === 'Expired') {
        details.flags.push('contract_expired');
        score -= 10;
      }

      return { score: Math.max(0, Math.min(100, score)), details };
    } catch (error) {
      console.error('Error calculating activity score:', error);
      return { score: 50, details: { error: error.message } };
    }
  }

  /**
   * Calculate Project Progress Score (0-100)
   *
   * Factors:
   * - Journey progress percentage
   * - Journey stage
   * - Project status
   * - Revenue (if applicable)
   *
   * @param {Object} client - Client record
   * @returns {Object} Score and details
   */
  calculateProgressScore(client) {
    try {
      let score = 0;
      const details = {
        journeyProgress: client.journeyProgress,
        journeyStage: client.journeyStage,
        projectStatus: client.projectStatus,
        revenue: parseFloat(client.revenue) || 0,
        flags: [],
      };

      // Journey progress (60 points max)
      score += Math.round(client.journeyProgress * 0.6);

      // Journey stage bonus
      const stageBonus = {
        Foundation: 5,
        Prep: 10,
        Launch: 15,
        'Growth & Expansion': 20,
      };
      score += stageBonus[client.journeyStage] || 0;

      // Project status (20 points max)
      const statusScore = {
        Completed: 20,
        'In Progress': 15,
        Review: 10,
        Planning: 5,
        'On Hold': -10,
      };
      score += statusScore[client.projectStatus] || 0;

      if (client.projectStatus === 'On Hold') {
        details.flags.push('project_on_hold');
      }

      // Revenue bonus (if applicable)
      if (details.revenue > 10000) score += 10;
      else if (details.revenue > 5000) score += 5;

      return { score: Math.max(0, Math.min(100, score)), details };
    } catch (error) {
      console.error('Error calculating progress score:', error);
      return { score: 50, details: { error: error.message } };
    }
  }

  /**
   * Calculate Overall Health Score
   *
   * Combines all component scores with weights.
   *
   * @param {string} clientId - Client UUID
   * @returns {Promise<Object>} Complete health score data
   */
  async calculateHealthScore(clientId) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Calculate component scores
      const emailResult = await this.calculateEmailScore(client);
      const milestoneResult = await this.calculateMilestoneScore(client);
      const activityResult = await this.calculateActivityScore(client);
      const progressResult = this.calculateProgressScore(client);

      // Calculate weighted total
      const totalScore = Math.round(
        emailResult.score * this.weights.email +
          milestoneResult.score * this.weights.milestone +
          activityResult.score * this.weights.activity +
          progressResult.score * this.weights.progress
      );

      // Determine status
      let status = 'Green';
      if (totalScore < 50) status = 'Red';
      else if (totalScore < 80) status = 'Yellow';

      // Collect all flags
      const allFlags = [
        ...emailResult.details.flags,
        ...milestoneResult.details.flags,
        ...activityResult.details.flags,
        ...progressResult.details.flags,
      ];

      const healthData = {
        healthScore: totalScore,
        healthStatus: status,
        emailScore: emailResult.score,
        milestoneScore: milestoneResult.score,
        activityScore: activityResult.score,
        progressScore: progressResult.score,
        factors: {
          email: emailResult.details,
          milestone: milestoneResult.details,
          activity: activityResult.details,
          progress: progressResult.details,
        },
        flags: [...new Set(allFlags)],
        calculatedAt: new Date(),
      };

      return healthData;
    } catch (error) {
      console.error('Error calculating health score:', error);
      throw error;
    }
  }

  /**
   * Update Client Health Score
   *
   * Calculates and persists health score for a client.
   * Creates log entry for historical tracking.
   *
   * @param {string} clientId - Client UUID
   * @returns {Promise<Object>} Updated health data
   */
  async updateClientHealthScore(clientId) {
    try {
      const healthData = await this.calculateHealthScore(clientId);

      // Get previous score for delta calculation
      const previousLog = await HealthScoreLog.findOne({
        where: { clientId },
        order: [['createdAt', 'DESC']],
      });

      const previousScore = previousLog ? previousLog.healthScore : null;
      const scoreDelta = previousScore !== null ? healthData.healthScore - previousScore : 0;

      // Update client record
      await Client.update(
        {
          healthScore: healthData.healthScore,
          healthStatus: healthData.healthStatus,
          healthFactors: healthData.factors,
        },
        { where: { id: clientId } }
      );

      // Create log entry
      await HealthScoreLog.create({
        clientId,
        healthScore: healthData.healthScore,
        healthStatus: healthData.healthStatus,
        emailScore: healthData.emailScore,
        milestoneScore: healthData.milestoneScore,
        activityScore: healthData.activityScore,
        progressScore: healthData.progressScore,
        factors: healthData.factors,
        flags: healthData.flags,
        previousScore,
        scoreDelta,
        dataPoints: healthData,
      });

      // Log activity if status changed
      if (previousLog && previousLog.healthStatus !== healthData.healthStatus) {
        await ActivityLog.create({
          entityType: 'Client',
          entityId: clientId,
          activityType: 'health_score_changed',
          title: `Health status changed to ${healthData.healthStatus}`,
          description: `Score: ${healthData.healthScore} (${scoreDelta > 0 ? '+' : ''}${scoreDelta})`,
          metadata: {
            previousStatus: previousLog.healthStatus,
            newStatus: healthData.healthStatus,
            previousScore,
            newScore: healthData.healthScore,
            flags: healthData.flags,
          },
          isAutomated: true,
          icon: 'health',
          importance: healthData.healthStatus === 'Red' ? 'High' : 'Medium',
        });
      }

      return {
        ...healthData,
        previousScore,
        scoreDelta,
      };
    } catch (error) {
      console.error('Error updating health score:', error);
      throw error;
    }
  }

  /**
   * Update All Client Health Scores
   *
   * Background job to recalculate health scores for all active clients.
   * Should run periodically (e.g., every hour).
   *
   * @returns {Promise<Object>} Update summary
   */
  async updateAllHealthScores() {
    try {
      const activeClients = await Client.findAll({
        where: { status: 'Active' },
      });

      console.log(`Updating health scores for ${activeClients.length} clients`);

      const results = {
        total: activeClients.length,
        successful: 0,
        failed: 0,
        statusCounts: { Green: 0, Yellow: 0, Red: 0 },
      };

      for (const client of activeClients) {
        try {
          const healthData = await this.updateClientHealthScore(client.id);
          results.successful++;
          results.statusCounts[healthData.healthStatus]++;
        } catch (error) {
          console.error(`Failed to update health score for ${client.name}:`, error.message);
          results.failed++;
        }
      }

      console.log('Health score update completed:', results);
      return results;
    } catch (error) {
      console.error('Error updating all health scores:', error);
      throw error;
    }
  }
}

module.exports = new HealthScoreService();
