const { Client, Lead, Milestone } = require('../models');
const { Op } = require('sequelize');
const { differenceInDays, addDays, format } = require('date-fns');
const launchReadinessService = require('./launchReadinessService');

/**
 * Smart Alerts Service
 *
 * Generates intelligent alerts and daily CEO briefings.
 * Identifies clients and leads that need immediate attention.
 *
 * Alert Types:
 * - Stuck clients (no progress, no activity)
 * - Launches this week
 * - Overdue launches
 * - Contract issues
 * - Stale leads
 * - Critical milestones overdue
 */

class AlertsService {
  /**
   * Generate Daily CEO Briefing
   *
   * Comprehensive daily report of what needs attention.
   *
   * @returns {Promise<Object>} Briefing data
   */
  async generateDailyCEOBriefing() {
    try {
      console.log('\n📋 Generating Daily CEO Briefing...');

      const briefing = {
        date: format(new Date(), 'EEEE, MMMM d, yyyy'),
        summary: {},
        urgentActions: [],
        launches: {
          thisWeek: [],
          overdue: [],
        },
        clientAlerts: [],
        leadAlerts: [],
        wins: [],
      };

      // 1. Get urgent client alerts
      const stuckClients = await this.getStuckClients();
      const unresponsiveClients = await this.getUnresponsiveClients();
      const contractIssues = await this.getContractIssues();

      briefing.clientAlerts = [
        ...stuckClients.map(c => ({
          type: 'stuck',
          severity: 'high',
          client: c,
          message: `${c.name} stuck in ${c.journeyStage} for ${c.daysInCurrentStage} days`,
          action: `Check in with ${c.name} - ${c.stuckReason || 'No recent progress'}`,
        })),
        ...unresponsiveClients.map(c => ({
          type: 'unresponsive',
          severity: 'high',
          client: c,
          message: `${c.name} - No activity in ${differenceInDays(new Date(), new Date(c.lastActivityDate || c.updatedAt))} days`,
          action: `Follow up with ${c.name}`,
        })),
        ...contractIssues.map(c => ({
          type: 'contract',
          severity: 'medium',
          client: c,
          message: `${c.name} - Contract ${c.contractStatus}`,
          action: `Send contract reminder to ${c.name}`,
        })),
      ];

      // 2. Get launch alerts
      const launchingThisWeek = await this.getClientsByLaunchDate(0, 7);
      const overdueLaunches = await this.getClientsByLaunchDate(-999, -1);

      briefing.launches.thisWeek = launchingThisWeek.map(c => ({
        name: c.name,
        launchDate: c.expectedLaunchDate,
        daysUntil: differenceInDays(new Date(c.expectedLaunchDate), new Date()),
        readinessScore: c.launchReadinessScore,
        isReady: c.launchReadinessScore >= 90,
      }));

      briefing.launches.overdue = overdueLaunches.map(c => ({
        name: c.name,
        expectedDate: c.expectedLaunchDate,
        daysOverdue: Math.abs(differenceInDays(new Date(c.expectedLaunchDate), new Date())),
        blockers: c.launchBlockers,
      }));

      // 3. Get stale leads
      const staleLeads = await this.getStaleLeads();
      briefing.leadAlerts = staleLeads.map(l => ({
        type: 'stale',
        severity: 'medium',
        lead: l,
        message: `${l.name} - No contact since ${format(new Date(l.lastContactedAt || l.createdAt), 'MMM d')}`,
        action: `Follow up on lead`,
      }));

      // 4. Get wins (recent milestones, launches)
      const recentWins = await this.getRecentWins();
      briefing.wins = recentWins;

      // 5. Generate summary
      briefing.summary = {
        totalAlerts: briefing.clientAlerts.length + briefing.leadAlerts.length,
        urgentActions: briefing.clientAlerts.filter(a => a.severity === 'high').length,
        launchesThisWeek: briefing.launches.thisWeek.length,
        overdueLaunches: briefing.launches.overdue.length,
        staleLeads: briefing.leadAlerts.length,
        wins: briefing.wins.length,
      };

      // 6. Create urgent actions list
      briefing.urgentActions = [
        ...briefing.clientAlerts.filter(a => a.severity === 'high').map(a => a.action),
        ...briefing.launches.thisWeek
          .filter(l => !l.isReady)
          .map(l => `Prepare ${l.name} for launch (${l.daysUntil} days, readiness: ${l.readinessScore}%)`),
        ...briefing.launches.overdue.map(l => `Address ${l.name}'s overdue launch (${l.daysOverdue} days late)`),
      ].slice(0, 5); // Top 5 most urgent

      console.log('✓ Briefing generated');
      console.log(`  ${briefing.summary.urgentActions} urgent actions`);
      console.log(`  ${briefing.summary.launchesThisWeek} launches this week`);
      console.log(`  ${briefing.summary.totalAlerts} total alerts`);

      return briefing;
    } catch (error) {
      console.error('Error generating CEO briefing:', error);
      throw error;
    }
  }

  /**
   * Get Stuck Clients
   *
   * Clients who haven't made progress in their current stage.
   */
  async getStuckClients() {
    try {
      const clients = await Client.findAll({
        where: {
          status: 'Active',
          isStuck: true,
        },
        order: [['daysInCurrentStage', 'DESC']],
      });

      return clients;
    } catch (error) {
      console.error('Error getting stuck clients:', error);
      return [];
    }
  }

  /**
   * Get Unresponsive Clients
   *
   * Clients with no activity in 7+ days.
   */
  async getUnresponsiveClients() {
    try {
      const sevenDaysAgo = addDays(new Date(), -7);

      const clients = await Client.findAll({
        where: {
          status: 'Active',
          [Op.or]: [
            { lastActivityDate: { [Op.lt]: sevenDaysAgo } },
            { lastActivityDate: null },
          ],
        },
        order: [['lastActivityDate', 'ASC']],
        limit: 10,
      });

      return clients;
    } catch (error) {
      console.error('Error getting unresponsive clients:', error);
      return [];
    }
  }

  /**
   * Get Contract Issues
   *
   * Clients with unsigned or expired contracts.
   */
  async getContractIssues() {
    try {
      const clients = await Client.findAll({
        where: {
          status: 'Active',
          contractStatus: { [Op.in]: ['Pending', 'Sent', 'Expired'] },
        },
      });

      return clients;
    } catch (error) {
      console.error('Error getting contract issues:', error);
      return [];
    }
  }

  /**
   * Get Clients by Launch Date Range
   *
   * @param {number} daysMin - Minimum days from now
   * @param {number} daysMax - Maximum days from now
   */
  async getClientsByLaunchDate(daysMin, daysMax) {
    try {
      const minDate = addDays(new Date(), daysMin);
      const maxDate = addDays(new Date(), daysMax);

      const clients = await Client.findAll({
        where: {
          status: 'Active',
          expectedLaunchDate: {
            [Op.between]: [minDate, maxDate],
          },
          actualLaunchDate: null, // Not yet launched
        },
        order: [['expectedLaunchDate', 'ASC']],
      });

      return clients;
    } catch (error) {
      console.error('Error getting clients by launch date:', error);
      return [];
    }
  }

  /**
   * Get Stale Leads
   *
   * Leads not contacted in 7+ days.
   */
  async getStaleLeads() {
    try {
      const sevenDaysAgo = addDays(new Date(), -7);

      const leads = await Lead.findAll({
        where: {
          stage: { [Op.in]: ['Warm', 'Interested', 'Almost Onboarded'] },
          [Op.or]: [
            { lastContactedAt: { [Op.lt]: sevenDaysAgo } },
            { lastContactedAt: null, createdAt: { [Op.lt]: sevenDaysAgo } },
          ],
        },
        order: [['fitScore', 'DESC']],
        limit: 10,
      });

      return leads;
    } catch (error) {
      console.error('Error getting stale leads:', error);
      return [];
    }
  }

  /**
   * Get Recent Wins
   *
   * Positive events in the last 7 days.
   */
  async getRecentWins() {
    try {
      const sevenDaysAgo = addDays(new Date(), -7);
      const wins = [];

      // Recently completed milestones
      const completedMilestones = await Milestone.findAll({
        where: {
          status: 'Completed',
          completedAt: { [Op.gte]: sevenDaysAgo },
        },
        include: [{ model: Client, as: 'client' }],
        order: [['completedAt', 'DESC']],
        limit: 5,
      });

      wins.push(
        ...completedMilestones.map(m => ({
          type: 'milestone',
          message: `${m.client.name} completed "${m.title}"`,
          date: m.completedAt,
        }))
      );

      // New onboardings
      const newClients = await Client.findAll({
        where: {
          onboardedAt: { [Op.gte]: sevenDaysAgo },
        },
        order: [['onboardedAt', 'DESC']],
        limit: 3,
      });

      wins.push(
        ...newClients.map(c => ({
          type: 'onboarding',
          message: `${c.name} onboarded as new client`,
          date: c.onboardedAt,
        }))
      );

      // Clients now ready to launch
      const readyClients = await Client.findAll({
        where: {
          launchReadinessScore: { [Op.gte]: 90 },
          status: 'Active',
        },
        limit: 3,
      });

      wins.push(
        ...readyClients.map(c => ({
          type: 'ready',
          message: `${c.name} is ready to launch! (${c.launchReadinessScore}%)`,
          date: new Date(),
        }))
      );

      return wins.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting recent wins:', error);
      return [];
    }
  }

  /**
   * Get Alert Summary
   *
   * Quick summary of all alerts.
   */
  async getAlertSummary() {
    try {
      const [
        stuckCount,
        unresponsiveCount,
        contractIssuesCount,
        launchingThisWeek,
        overdueLaunches,
        staleLeadsCount,
      ] = await Promise.all([
        Client.count({ where: { status: 'Active', isStuck: true } }),
        Client.count({
          where: {
            status: 'Active',
            [Op.or]: [
              { lastActivityDate: { [Op.lt]: addDays(new Date(), -7) } },
              { lastActivityDate: null },
            ],
          },
        }),
        Client.count({
          where: {
            status: 'Active',
            contractStatus: { [Op.in]: ['Pending', 'Sent', 'Expired'] },
          },
        }),
        this.getClientsByLaunchDate(0, 7),
        this.getClientsByLaunchDate(-999, -1),
        Lead.count({
          where: {
            stage: { [Op.in]: ['Warm', 'Interested', 'Almost Onboarded'] },
            [Op.or]: [
              { lastContactedAt: { [Op.lt]: addDays(new Date(), -7) } },
              { lastContactedAt: null, createdAt: { [Op.lt]: addDays(new Date(), -7) } },
            ],
          },
        }),
      ]);

      return {
        stuckClients: stuckCount,
        unresponsiveClients: unresponsiveCount,
        contractIssues: contractIssuesCount,
        launchingThisWeek: launchingThisWeek.length,
        overdueLaunches: overdueLaunches.length,
        staleLeads: staleLeadsCount,
        totalAlerts: stuckCount + unresponsiveCount + contractIssuesCount + overdueLaunches.length + staleLeadsCount,
      };
    } catch (error) {
      console.error('Error getting alert summary:', error);
      throw error;
    }
  }
}

module.exports = new AlertsService();
