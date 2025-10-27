const analyticsService = require('../services/analyticsService');

/**
 * Analytics Controller
 *
 * Handles analytics and reporting endpoints
 */

/**
 * Get overview analytics
 * GET /api/v1/analytics/overview
 */
exports.getOverviewAnalytics = async (req, res) => {
  try {
    const { dateRange = 30 } = req.query;
    const days = parseInt(dateRange);

    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        error: 'dateRange must be between 1 and 365 days',
      });
    }

    const analytics = await analyticsService.getOverviewAnalytics(days);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error getting overview analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get overview analytics',
      details: error.message,
    });
  }
};

/**
 * Get client-specific analytics
 * GET /api/v1/analytics/client/:clientId
 */
exports.getClientAnalytics = async (req, res) => {
  try {
    const { clientId } = req.params;

    const analytics = await analyticsService.getClientAnalytics(clientId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error getting client analytics:', error);

    if (error.message === 'Client not found') {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get client analytics',
      details: error.message,
    });
  }
};

/**
 * Get document performance analytics
 * GET /api/v1/analytics/document-performance
 */
exports.getDocumentPerformance = async (req, res) => {
  try {
    const performance = await analyticsService.getDocumentPerformance();

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error('Error getting document performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document performance',
      details: error.message,
    });
  }
};

/**
 * Track a manual event (for testing or manual tracking)
 * POST /api/v1/analytics/track
 */
exports.trackEvent = async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData.eventType || !eventData.clientId) {
      return res.status(400).json({
        success: false,
        error: 'eventType and clientId are required',
      });
    }

    const event = await analyticsService.trackEvent(eventData);

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
      details: error.message,
    });
  }
};

module.exports = exports;
