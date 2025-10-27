const webhookService = require('../services/webhookService');

/**
 * Webhook Controller
 *
 * Manages webhooks for third-party integrations
 */

/**
 * Register a new webhook
 * POST /api/v1/clients/:clientId/webhooks
 */
exports.registerWebhook = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { url, events } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Events array is required and must not be empty',
      });
    }

    const webhook = await webhookService.registerWebhook(clientId, { url, events });

    res.json({
      success: true,
      data: webhook,
      message: 'Webhook registered successfully. Please store the secret securely.',
    });
  } catch (error) {
    console.error('Error registering webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all webhooks for a client
 * GET /api/v1/clients/:clientId/webhooks
 */
exports.getWebhooks = async (req, res) => {
  try {
    const { clientId } = req.params;

    const webhooks = await webhookService.getWebhooks(clientId);

    res.json({
      success: true,
      data: webhooks,
    });
  } catch (error) {
    console.error('Error getting webhooks:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a webhook
 * DELETE /api/v1/clients/:clientId/webhooks/:webhookId
 */
exports.deleteWebhook = async (req, res) => {
  try {
    const { clientId, webhookId } = req.params;

    const result = await webhookService.deleteWebhook(clientId, webhookId);

    res.json(result);
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Test a webhook
 * POST /api/v1/clients/:clientId/webhooks/:webhookId/test
 */
exports.testWebhook = async (req, res) => {
  try {
    const { clientId, webhookId } = req.params;

    const result = await webhookService.testWebhook(clientId, webhookId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test webhook sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send test webhook',
      });
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = exports;
