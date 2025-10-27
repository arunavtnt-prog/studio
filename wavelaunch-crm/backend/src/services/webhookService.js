const axios = require('axios');
const crypto = require('crypto');
const Client = require('../models/Client');

/**
 * Webhook Service
 *
 * Manages webhooks for third-party integrations.
 * Allows external systems to receive real-time events from the CRM.
 */
class WebhookService {
  constructor() {
    this.enabled = process.env.WEBHOOKS_ENABLED !== 'false';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Register a new webhook
   */
  async registerWebhook(clientId, webhookData) {
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    // Initialize webhooks array if it doesn't exist
    const webhooks = client.webhooks || [];

    // Generate webhook ID and secret
    const webhookId = this.generateId();
    const secret = this.generateSecret();

    const newWebhook = {
      webhookId,
      url: webhookData.url,
      events: webhookData.events || ['*'], // '*' means all events
      secret,
      active: true,
      createdAt: new Date(),
      failureCount: 0,
      lastTriggeredAt: null,
      lastError: null,
    };

    webhooks.push(newWebhook);

    await Client.update(
      { webhooks },
      { where: { id: clientId } }
    );

    // Return webhook info (including secret for one-time viewing)
    return {
      webhookId,
      url: newWebhook.url,
      events: newWebhook.events,
      secret, // Client should store this securely
      active: true,
      createdAt: newWebhook.createdAt,
    };
  }

  /**
   * Trigger webhooks for an event
   */
  async triggerWebhook(clientId, event, data) {
    if (!this.enabled) {
      console.log('[Webhooks] Webhooks disabled');
      return;
    }

    try {
      const client = await Client.findByPk(clientId);

      if (!client || !client.webhooks) {
        return;
      }

      // Find active webhooks that listen to this event
      const webhooks = client.webhooks.filter(
        (w) => w.active && (w.events.includes('*') || w.events.includes(event))
      );

      if (webhooks.length === 0) {
        return;
      }

      console.log(`[Webhooks] Triggering ${webhooks.length} webhook(s) for event: ${event}`);

      // Send webhooks in parallel
      const promises = webhooks.map((webhook) => this.sendWebhook(clientId, webhook, event, data));

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('[Webhooks] Error triggering webhooks:', error);
    }
  }

  /**
   * Send a webhook with retries
   */
  async sendWebhook(clientId, webhook, event, data, attempt = 1) {
    try {
      const payload = {
        webhookId: webhook.webhookId,
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      const signature = this.generateSignature(payload, webhook.secret);

      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Wavelaunch-Signature': signature,
          'X-Wavelaunch-Event': event,
          'X-Wavelaunch-Webhook-Id': webhook.webhookId,
        },
        timeout: 10000, // 10 second timeout
      });

      // Success - update webhook stats
      await this.updateWebhookSuccess(clientId, webhook.webhookId);

      console.log(`[Webhooks] Successfully sent to ${webhook.url}`);

      return {
        success: true,
        statusCode: response.status,
      };
    } catch (error) {
      console.error(`[Webhooks] Failed to send to ${webhook.url}:`, error.message);

      // Retry logic
      if (attempt < this.maxRetries) {
        console.log(`[Webhooks] Retrying... (attempt ${attempt + 1}/${this.maxRetries})`);
        await this.sleep(this.retryDelay * attempt);
        return await this.sendWebhook(clientId, webhook, event, data, attempt + 1);
      }

      // Max retries reached - log failure
      await this.updateWebhookFailure(clientId, webhook.webhookId, error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update webhook on successful delivery
   */
  async updateWebhookSuccess(clientId, webhookId) {
    const client = await Client.findByPk(clientId);

    if (!client || !client.webhooks) {
      return;
    }

    const webhooks = client.webhooks.map((w) => {
      if (w.webhookId === webhookId) {
        return {
          ...w,
          failureCount: 0,
          lastTriggeredAt: new Date(),
          lastError: null,
        };
      }
      return w;
    });

    await Client.update({ webhooks }, { where: { id: clientId } });
  }

  /**
   * Update webhook on failure
   */
  async updateWebhookFailure(clientId, webhookId, errorMessage) {
    const client = await Client.findByPk(clientId);

    if (!client || !client.webhooks) {
      return;
    }

    const webhooks = client.webhooks.map((w) => {
      if (w.webhookId === webhookId) {
        const failureCount = (w.failureCount || 0) + 1;
        const active = failureCount < 5; // Disable after 5 consecutive failures

        return {
          ...w,
          failureCount,
          lastError: errorMessage,
          lastFailedAt: new Date(),
          active,
        };
      }
      return w;
    });

    await Client.update({ webhooks }, { where: { id: clientId } });

    // Log if webhook was disabled
    if (!webhooks.find((w) => w.webhookId === webhookId).active) {
      console.log(`[Webhooks] Webhook ${webhookId} disabled after 5 consecutive failures`);
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate a unique webhook ID
   */
  generateId() {
    return `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate a secure webhook secret
   */
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get all webhooks for a client
   */
  async getWebhooks(clientId) {
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    // Return webhooks without secrets
    return (client.webhooks || []).map((w) => ({
      webhookId: w.webhookId,
      url: w.url,
      events: w.events,
      active: w.active,
      createdAt: w.createdAt,
      failureCount: w.failureCount,
      lastTriggeredAt: w.lastTriggeredAt,
      lastError: w.lastError,
    }));
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(clientId, webhookId) {
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    const webhooks = (client.webhooks || []).filter((w) => w.webhookId !== webhookId);

    await Client.update({ webhooks }, { where: { id: clientId } });

    return { success: true, message: 'Webhook deleted' };
  }

  /**
   * Test a webhook
   */
  async testWebhook(clientId, webhookId) {
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    const webhook = (client.webhooks || []).find((w) => w.webhookId === webhookId);

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // Send test event
    return await this.sendWebhook(clientId, webhook, 'test', {
      message: 'This is a test webhook event',
      clientId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sleep utility for retries
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new WebhookService();
