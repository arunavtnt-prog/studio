const { Op } = require('sequelize');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Client = require('../models/Client');
const sequelize = require('../config/database');

/**
 * Analytics Service
 *
 * Tracks and analyzes all events in the onboarding system.
 * Provides insights into document generation, client engagement, and system performance.
 */
class AnalyticsService {
  /**
   * Track an event
   */
  async trackEvent(eventData) {
    try {
      const event = await AnalyticsEvent.create({
        eventType: eventData.eventType,
        eventTimestamp: eventData.eventTimestamp || new Date(),
        clientId: eventData.clientId,
        monthNumber: eventData.monthNumber,
        documentNumber: eventData.documentNumber,
        documentName: eventData.documentName,
        durationMs: eventData.durationMs,
        tokensUsed: eventData.tokensUsed,
        llmProvider: eventData.llmProvider,
        success: eventData.success !== undefined ? eventData.success : true,
        errorMessage: eventData.errorMessage,
        metadata: eventData.metadata || {},
        userId: eventData.userId,
        userEmail: eventData.userEmail,
        sessionId: eventData.sessionId,
        relatedEventId: eventData.relatedEventId,
      });

      return event;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw - analytics should never break the main flow
      return null;
    }
  }

  /**
   * Get overview analytics
   */
  async getOverviewAnalytics(dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Document generation metrics
      const generationEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: {
            [Op.in]: ['document_generation_started', 'document_generation_completed', 'document_generation_failed'],
          },
          eventTimestamp: { [Op.gte]: startDate },
        },
        order: [['eventTimestamp', 'ASC']],
      });

      const generationStarted = generationEvents.filter((e) => e.eventType === 'document_generation_started');
      const generationCompleted = generationEvents.filter((e) => e.eventType === 'document_generation_completed');
      const generationFailed = generationEvents.filter((e) => e.eventType === 'document_generation_failed');

      const avgGenerationTime =
        generationCompleted.length > 0
          ? generationCompleted.reduce((sum, e) => sum + (e.durationMs || 0), 0) / generationCompleted.length
          : 0;

      const generationSuccessRate =
        generationStarted.length > 0
          ? (generationCompleted.length / generationStarted.length) * 100
          : 0;

      const totalTokensUsed = generationCompleted.reduce((sum, e) => sum + (e.tokensUsed || 0), 0);

      // Client engagement metrics
      const viewEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_viewed',
          eventTimestamp: { [Op.gte]: startDate },
        },
      });

      const approvalEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_approved',
          eventTimestamp: { [Op.gte]: startDate },
        },
      });

      const revisionEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_revision_requested',
          eventTimestamp: { [Op.gte]: startDate },
        },
      });

      // Calculate time to view (from generation to first view)
      const timeToViewData = await this.calculateTimeToView(startDate);

      // Calculate time to approval (from generation to approval)
      const timeToApprovalData = await this.calculateTimeToApproval(startDate);

      // Calculate revision rate
      const totalDocumentsGenerated = generationCompleted.length;
      const revisionRate =
        totalDocumentsGenerated > 0 ? (revisionEvents.length / totalDocumentsGenerated) * 100 : 0;

      // Provider breakdown
      const providerBreakdown = {
        openai: generationCompleted.filter((e) => e.llmProvider === 'openai').length,
        claude: generationCompleted.filter((e) => e.llmProvider === 'claude').length,
        gemini: generationCompleted.filter((e) => e.llmProvider === 'gemini').length,
      };

      // Month completion metrics
      const monthCompletedEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'month_completed',
          eventTimestamp: { [Op.gte]: startDate },
        },
      });

      // Documents generated per day (for chart)
      const documentsPerDay = await this.getDocumentsPerDay(startDate);

      return {
        dateRange: {
          start: startDate,
          end: new Date(),
          days: dateRange,
        },
        documentGeneration: {
          totalGenerated: generationCompleted.length,
          totalFailed: generationFailed.length,
          successRate: Math.round(generationSuccessRate * 100) / 100,
          avgGenerationTimeMs: Math.round(avgGenerationTime),
          avgGenerationTimeSeconds: Math.round(avgGenerationTime / 1000),
          totalTokensUsed,
          avgTokensPerDocument: Math.round(totalTokensUsed / (generationCompleted.length || 1)),
        },
        clientEngagement: {
          totalViews: viewEvents.length,
          totalApprovals: approvalEvents.length,
          totalRevisions: revisionEvents.length,
          revisionRate: Math.round(revisionRate * 100) / 100,
          avgTimeToViewHours: timeToViewData.avgHours,
          avgTimeToApprovalDays: timeToApprovalData.avgDays,
        },
        programProgress: {
          monthsCompleted: monthCompletedEvents.length,
          activeClients: await this.getActiveClientsCount(),
        },
        providerBreakdown,
        documentsPerDay,
      };
    } catch (error) {
      console.error('Error getting overview analytics:', error);
      throw error;
    }
  }

  /**
   * Get client-specific analytics
   */
  async getClientAnalytics(clientId) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Get all events for this client
      const events = await AnalyticsEvent.findAll({
        where: { clientId },
        order: [['eventTimestamp', 'ASC']],
      });

      // Generation metrics
      const generationCompleted = events.filter((e) => e.eventType === 'document_generation_completed');
      const avgGenerationTime =
        generationCompleted.length > 0
          ? generationCompleted.reduce((sum, e) => sum + (e.durationMs || 0), 0) / generationCompleted.length
          : 0;

      // Engagement metrics
      const viewEvents = events.filter((e) => e.eventType === 'document_viewed');
      const approvalEvents = events.filter((e) => e.eventType === 'document_approved');
      const revisionEvents = events.filter((e) => e.eventType === 'document_revision_requested');

      // Month progress
      const monthCompletedEvents = events.filter((e) => e.eventType === 'month_completed');
      const monthUnlockedEvents = events.filter((e) => e.eventType === 'month_unlocked');

      // Time to approval per document
      const documentApprovalTimes = await this.getDocumentApprovalTimes(clientId);

      // Activity timeline
      const recentActivity = events.slice(-20).reverse(); // Last 20 events

      return {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          currentMonth: client.currentMonth,
        },
        documentGeneration: {
          totalGenerated: generationCompleted.length,
          avgGenerationTimeSeconds: Math.round(avgGenerationTime / 1000),
          tokensUsed: generationCompleted.reduce((sum, e) => sum + (e.tokensUsed || 0), 0),
        },
        engagement: {
          totalViews: viewEvents.length,
          totalApprovals: approvalEvents.length,
          totalRevisions: revisionEvents.length,
          revisionRate:
            generationCompleted.length > 0
              ? Math.round((revisionEvents.length / generationCompleted.length) * 10000) / 100
              : 0,
        },
        programProgress: {
          currentMonth: client.currentMonth,
          completedMonths: monthCompletedEvents.length,
          unlockedMonths: monthUnlockedEvents.length,
          overallProgress: Math.round((approvalEvents.length / 40) * 100), // 40 total documents
        },
        documentApprovalTimes,
        recentActivity: recentActivity.map((e) => ({
          eventType: e.eventType,
          timestamp: e.eventTimestamp,
          monthNumber: e.monthNumber,
          documentName: e.documentName,
          durationMs: e.durationMs,
        })),
      };
    } catch (error) {
      console.error('Error getting client analytics:', error);
      throw error;
    }
  }

  /**
   * Get document performance analytics
   */
  async getDocumentPerformance() {
    try {
      // Get all document generation events
      const generationEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_generation_completed',
        },
      });

      // Group by document name and calculate metrics
      const documentStats = {};

      generationEvents.forEach((event) => {
        const docKey = event.documentName || 'Unknown';

        if (!documentStats[docKey]) {
          documentStats[docKey] = {
            documentName: docKey,
            timesGenerated: 0,
            totalGenerationTime: 0,
            totalTokens: 0,
            approvals: 0,
            revisions: 0,
          };
        }

        documentStats[docKey].timesGenerated += 1;
        documentStats[docKey].totalGenerationTime += event.durationMs || 0;
        documentStats[docKey].totalTokens += event.tokensUsed || 0;
      });

      // Get approval and revision counts
      const approvalEvents = await AnalyticsEvent.findAll({
        where: { eventType: 'document_approved' },
      });

      const revisionEvents = await AnalyticsEvent.findAll({
        where: { eventType: 'document_revision_requested' },
      });

      approvalEvents.forEach((event) => {
        const docKey = event.documentName || 'Unknown';
        if (documentStats[docKey]) {
          documentStats[docKey].approvals += 1;
        }
      });

      revisionEvents.forEach((event) => {
        const docKey = event.documentName || 'Unknown';
        if (documentStats[docKey]) {
          documentStats[docKey].revisions += 1;
        }
      });

      // Calculate averages and rates
      const documentPerformance = Object.values(documentStats).map((doc) => ({
        documentName: doc.documentName,
        timesGenerated: doc.timesGenerated,
        avgGenerationTimeSeconds: Math.round(doc.totalGenerationTime / doc.timesGenerated / 1000),
        avgTokens: Math.round(doc.totalTokens / doc.timesGenerated),
        approvals: doc.approvals,
        revisions: doc.revisions,
        revisionRate:
          doc.timesGenerated > 0 ? Math.round((doc.revisions / doc.timesGenerated) * 10000) / 100 : 0,
        approvalRate:
          doc.timesGenerated > 0 ? Math.round((doc.approvals / doc.timesGenerated) * 10000) / 100 : 0,
      }));

      // Sort by times generated (most popular first)
      documentPerformance.sort((a, b) => b.timesGenerated - a.timesGenerated);

      return documentPerformance;
    } catch (error) {
      console.error('Error getting document performance:', error);
      throw error;
    }
  }

  /**
   * Calculate average time from document generation to first view
   */
  async calculateTimeToView(startDate) {
    try {
      const generationEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_generation_completed',
          eventTimestamp: { [Op.gte]: startDate },
        },
      });

      const timeToViews = [];

      for (const genEvent of generationEvents) {
        const firstView = await AnalyticsEvent.findOne({
          where: {
            eventType: 'document_viewed',
            clientId: genEvent.clientId,
            monthNumber: genEvent.monthNumber,
            documentNumber: genEvent.documentNumber,
            eventTimestamp: { [Op.gte]: genEvent.eventTimestamp },
          },
          order: [['eventTimestamp', 'ASC']],
        });

        if (firstView) {
          const timeToView = firstView.eventTimestamp - genEvent.eventTimestamp;
          timeToViews.push(timeToView);
        }
      }

      const avgTimeToView = timeToViews.length > 0 ? timeToViews.reduce((a, b) => a + b, 0) / timeToViews.length : 0;

      return {
        count: timeToViews.length,
        avgMs: Math.round(avgTimeToView),
        avgHours: Math.round(avgTimeToView / 1000 / 60 / 60 * 10) / 10,
      };
    } catch (error) {
      console.error('Error calculating time to view:', error);
      return { count: 0, avgMs: 0, avgHours: 0 };
    }
  }

  /**
   * Calculate average time from document generation to approval
   */
  async calculateTimeToApproval(startDate) {
    try {
      const generationEvents = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_generation_completed',
          eventTimestamp: { [Op.gte]: startDate },
        },
      });

      const timeToApprovals = [];

      for (const genEvent of generationEvents) {
        const approval = await AnalyticsEvent.findOne({
          where: {
            eventType: 'document_approved',
            clientId: genEvent.clientId,
            monthNumber: genEvent.monthNumber,
            documentNumber: genEvent.documentNumber,
            eventTimestamp: { [Op.gte]: genEvent.eventTimestamp },
          },
          order: [['eventTimestamp', 'ASC']],
        });

        if (approval) {
          const timeToApproval = approval.eventTimestamp - genEvent.eventTimestamp;
          timeToApprovals.push(timeToApproval);
        }
      }

      const avgTimeToApproval =
        timeToApprovals.length > 0 ? timeToApprovals.reduce((a, b) => a + b, 0) / timeToApprovals.length : 0;

      return {
        count: timeToApprovals.length,
        avgMs: Math.round(avgTimeToApproval),
        avgDays: Math.round(avgTimeToApproval / 1000 / 60 / 60 / 24 * 10) / 10,
      };
    } catch (error) {
      console.error('Error calculating time to approval:', error);
      return { count: 0, avgMs: 0, avgDays: 0 };
    }
  }

  /**
   * Get document approval times for a specific client
   */
  async getDocumentApprovalTimes(clientId) {
    try {
      const approvals = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_approved',
          clientId,
        },
        order: [['eventTimestamp', 'ASC']],
      });

      const approvalTimes = [];

      for (const approval of approvals) {
        const generation = await AnalyticsEvent.findOne({
          where: {
            eventType: 'document_generation_completed',
            clientId,
            monthNumber: approval.monthNumber,
            documentNumber: approval.documentNumber,
            eventTimestamp: { [Op.lte]: approval.eventTimestamp },
          },
          order: [['eventTimestamp', 'DESC']],
        });

        if (generation) {
          const timeToApproval = approval.eventTimestamp - generation.eventTimestamp;
          approvalTimes.push({
            monthNumber: approval.monthNumber,
            documentName: approval.documentName,
            generatedAt: generation.eventTimestamp,
            approvedAt: approval.eventTimestamp,
            timeToApprovalDays: Math.round(timeToApproval / 1000 / 60 / 60 / 24 * 10) / 10,
          });
        }
      }

      return approvalTimes;
    } catch (error) {
      console.error('Error getting document approval times:', error);
      return [];
    }
  }

  /**
   * Get number of active clients (clients with activity in last 30 days)
   */
  async getActiveClientsCount() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeClients = await AnalyticsEvent.findAll({
        where: {
          eventTimestamp: { [Op.gte]: thirtyDaysAgo },
        },
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('clientId')), 'clientId']],
      });

      return activeClients.length;
    } catch (error) {
      console.error('Error getting active clients count:', error);
      return 0;
    }
  }

  /**
   * Get documents generated per day for chart
   */
  async getDocumentsPerDay(startDate) {
    try {
      const events = await AnalyticsEvent.findAll({
        where: {
          eventType: 'document_generation_completed',
          eventTimestamp: { [Op.gte]: startDate },
        },
        order: [['eventTimestamp', 'ASC']],
      });

      // Group by day
      const dayGroups = {};

      events.forEach((event) => {
        const day = event.eventTimestamp.toISOString().split('T')[0];
        if (!dayGroups[day]) {
          dayGroups[day] = 0;
        }
        dayGroups[day] += 1;
      });

      // Convert to array for chart
      return Object.keys(dayGroups)
        .sort()
        .map((day) => ({
          date: day,
          count: dayGroups[day],
        }));
    } catch (error) {
      console.error('Error getting documents per day:', error);
      return [];
    }
  }
}

module.exports = new AnalyticsService();
