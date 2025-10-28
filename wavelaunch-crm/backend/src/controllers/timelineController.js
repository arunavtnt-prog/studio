const { Client, Milestone } = require('../models');

/**
 * Timeline Controller
 *
 * Epic 2, Story 2.1: View Project Timeline/Roadmap
 *
 * Manages project timeline and roadmap visualization:
 * - Shows journey stages with progress
 * - Highlights current stage
 * - Lists milestones organized by stage/category
 * - Provides visual timeline data for frontend
 */

const timelineController = {
  /**
   * Get Project Timeline/Roadmap for a Client
   * GET /api/v1/clients/:clientId/timeline
   *
   * Epic 2, Story 2.1: View Project Timeline/Roadmap
   * AC1: Timeline shows stages, highlights current, lists milestones
   */
  async getClientTimeline(req, res) {
    try {
      const { clientId } = req.params;

      // Get client with milestones
      const client = await Client.findByPk(clientId, {
        attributes: [
          'id',
          'name',
          'journeyStage',
          'journeyProgress',
          'currentMonth',
          'completedMonths',
          'monthProgress',
          'status',
          'onboardedAt',
          'expectedLaunchDate',
          'actualLaunchDate',
        ],
        include: [
          {
            model: Milestone,
            as: 'milestones',
            order: [['order', 'ASC'], ['targetDate', 'ASC']],
          },
        ],
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      // Define 8-month journey stages
      const journeyStages = [
        {
          month: 1,
          stage: 'Month 1 - Foundation Excellence',
          description: 'Initial setup and planning',
          status: getStageStatus(client, 1),
        },
        {
          month: 2,
          stage: 'Month 2 - Brand Readiness & Productization',
          description: 'Brand development and product planning',
          status: getStageStatus(client, 2),
        },
        {
          month: 3,
          stage: 'Month 3 - Market Entry Preparation',
          description: 'Market research and positioning',
          status: getStageStatus(client, 3),
        },
        {
          month: 4,
          stage: 'Month 4 - Sales Engine & Launch Infrastructure',
          description: 'Sales systems and launch preparation',
          status: getStageStatus(client, 4),
        },
        {
          month: 5,
          stage: 'Month 5 - Pre-Launch Mastery',
          description: 'Final preparations for launch',
          status: getStageStatus(client, 5),
        },
        {
          month: 6,
          stage: 'Month 6 - Soft Launch Execution',
          description: 'Soft launch and testing',
          status: getStageStatus(client, 6),
        },
        {
          month: 7,
          stage: 'Month 7 - Scaling & Growth Systems',
          description: 'Scaling operations and growth',
          status: getStageStatus(client, 7),
        },
        {
          month: 8,
          stage: 'Month 8 - Full Launch & Market Domination',
          description: 'Full market launch and optimization',
          status: getStageStatus(client, 8),
        },
      ];

      // Organize milestones by category
      const milestonesByCategory = {
        Onboarding: [],
        Product: [],
        Launch: [],
        Revenue: [],
        Growth: [],
        Content: [],
        Custom: [],
      };

      client.milestones.forEach(milestone => {
        if (milestonesByCategory[milestone.category]) {
          milestonesByCategory[milestone.category].push({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            progress: milestone.progress,
            category: milestone.category,
            priority: milestone.priority,
            targetDate: milestone.targetDate,
            startedAt: milestone.startedAt,
            completedAt: milestone.completedAt,
            order: milestone.order,
          });
        }
      });

      // Calculate timeline metrics
      const totalMilestones = client.milestones.length;
      const completedMilestones = client.milestones.filter(m => m.status === 'Completed').length;
      const inProgressMilestones = client.milestones.filter(m => m.status === 'In Progress').length;
      const upcomingMilestones = client.milestones.filter(m => m.status === 'Pending').length;

      const milestonCompletionRate = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

      // Get next milestone
      const nextMilestone = client.milestones.find(m => m.status === 'Pending' || m.status === 'In Progress');

      // Calculate time metrics
      const daysInProgram = Math.floor(
        (new Date() - new Date(client.onboardedAt)) / (1000 * 60 * 60 * 24)
      );

      const daysUntilLaunch = client.expectedLaunchDate
        ? Math.floor((new Date(client.expectedLaunchDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      // Build timeline response
      const timeline = {
        client: {
          id: client.id,
          name: client.name,
          status: client.status,
        },
        journey: {
          currentStage: client.journeyStage,
          currentMonth: client.currentMonth,
          overallProgress: client.journeyProgress,
          completedMonths: client.completedMonths,
          stages: journeyStages,
        },
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          inProgress: inProgressMilestones,
          upcoming: upcomingMilestones,
          completionRate: milestoneCompletionRate,
          byCategory: milestonesByCategory,
          next: nextMilestone ? {
            id: nextMilestone.id,
            title: nextMilestone.title,
            category: nextMilestone.category,
            targetDate: nextMilestone.targetDate,
            priority: nextMilestone.priority,
          } : null,
        },
        timeline: {
          onboardedAt: client.onboardedAt,
          daysInProgram,
          expectedLaunchDate: client.expectedLaunchDate,
          actualLaunchDate: client.actualLaunchDate,
          daysUntilLaunch,
        },
      };

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Roadmap Summary for All Clients
   * GET /api/v1/timeline/roadmap
   *
   * Provides overview of all client journey progress
   */
  async getAllClientsRoadmap(req, res) {
    try {
      const clients = await Client.findAll({
        attributes: [
          'id',
          'name',
          'journeyStage',
          'journeyProgress',
          'currentMonth',
          'healthScore',
          'healthStatus',
          'status',
          'expectedLaunchDate',
        ],
        include: [
          {
            model: Milestone,
            as: 'milestones',
            attributes: ['id', 'status'],
          },
        ],
        where: {
          status: ['Active', 'Launched'],
        },
        order: [['journeyProgress', 'ASC']],
      });

      const roadmap = clients.map(client => {
        const totalMilestones = client.milestones.length;
        const completedMilestones = client.milestones.filter(m => m.status === 'Completed').length;

        return {
          id: client.id,
          name: client.name,
          journeyStage: client.journeyStage,
          currentMonth: client.currentMonth,
          journeyProgress: client.journeyProgress,
          healthScore: client.healthScore,
          healthStatus: client.healthStatus,
          status: client.status,
          expectedLaunchDate: client.expectedLaunchDate,
          milestones: {
            total: totalMilestones,
            completed: completedMilestones,
            completionRate: totalMilestones > 0
              ? Math.round((completedMilestones / totalMilestones) * 100)
              : 0,
          },
        };
      });

      // Group by journey stage
      const byStage = roadmap.reduce((acc, client) => {
        const stage = client.journeyStage;
        if (!acc[stage]) {
          acc[stage] = [];
        }
        acc[stage].push(client);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          clients: roadmap,
          byStage,
          summary: {
            total: roadmap.length,
            avgProgress: Math.round(
              roadmap.reduce((sum, c) => sum + c.journeyProgress, 0) / roadmap.length
            ),
            healthyClients: roadmap.filter(c => c.healthStatus === 'Green').length,
            atRiskClients: roadmap.filter(c => c.healthStatus === 'Red' || c.healthStatus === 'Yellow').length,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

/**
 * Helper: Determine stage status (completed, current, locked)
 */
function getStageStatus(client, monthNumber) {
  if (client.completedMonths && client.completedMonths.includes(monthNumber)) {
    return 'completed';
  } else if (client.currentMonth === monthNumber) {
    return 'current';
  } else if (monthNumber < client.currentMonth) {
    return 'completed'; // Past months are considered completed
  } else {
    return 'locked'; // Future months are locked
  }
}

module.exports = timelineController;
