const axios = require('axios');

/**
 * Discord Service
 *
 * Sends real-time notifications to Discord channels for team updates.
 * Uses Discord webhooks for rich embeds and notifications.
 */
class DiscordService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl && process.env.DISCORD_NOTIFICATIONS_ENABLED !== 'false';
  }

  /**
   * Send an embed to Discord
   */
  async sendEmbed(embed) {
    if (!this.enabled) {
      console.log('[Discord] Notifications disabled or webhook not configured');
      return { success: false, reason: 'disabled' };
    }

    try {
      await axios.post(this.webhookUrl, {
        username: 'Wavelaunch Bot',
        avatar_url: 'https://wavelaunchstudio.com/logo.png',
        embeds: [embed],
      });

      console.log('[Discord] Notification sent');
      return { success: true };
    } catch (error) {
      console.error('[Discord] Notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify when a document is generated
   */
  async notifyDocumentGenerated(clientName, documentName, monthNumber) {
    await this.sendEmbed({
      title: '📄 Document Generated',
      color: 3066993, // Green
      fields: [
        { name: 'Client', value: clientName, inline: true },
        { name: 'Month', value: `Month ${monthNumber}`, inline: true },
        { name: 'Document', value: documentName, inline: false },
      ],
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }

  /**
   * Notify when a revision is requested
   */
  async notifyRevisionRequested(clientName, documentName, monthNumber, revisionNotes) {
    await this.sendEmbed({
      title: '✏️ Revision Requested',
      color: 16750899, // Orange
      fields: [
        { name: 'Client', value: clientName, inline: true },
        { name: 'Month', value: `Month ${monthNumber}`, inline: true },
        { name: 'Document', value: documentName, inline: false },
        {
          name: 'Revision Notes',
          value: revisionNotes || 'No notes provided',
          inline: false,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }

  /**
   * Notify when a month is completed
   */
  async notifyMonthCompleted(clientName, monthNumber) {
    await this.sendEmbed({
      title: '🎉 Month Completed!',
      description: `**${clientName}** has completed Month ${monthNumber} of 8!`,
      color: 3066993, // Green
      thumbnail: {
        url: 'https://wavelaunchstudio.com/celebration.png',
      },
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }

  /**
   * Notify when a document is approved
   */
  async notifyDocumentApproved(clientName, documentName, monthNumber) {
    await this.sendEmbed({
      title: '✅ Document Approved',
      color: 3066993, // Green
      fields: [
        { name: 'Client', value: clientName, inline: true },
        { name: 'Month', value: `Month ${monthNumber}`, inline: true },
        { name: 'Document', value: documentName, inline: false },
      ],
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }

  /**
   * Notify when business plan is uploaded
   */
  async notifyBusinessPlanUploaded(clientName, fileName) {
    await this.sendEmbed({
      title: '📋 Business Plan Uploaded',
      color: 3447003, // Blue
      fields: [
        { name: 'Client', value: clientName, inline: true },
        { name: 'File', value: fileName, inline: true },
      ],
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }

  /**
   * Notify about errors or critical issues
   */
  async notifyError(errorTitle, errorMessage, context = {}) {
    await this.sendEmbed({
      title: `⚠️ ${errorTitle}`,
      description: errorMessage,
      color: 15158332, // Red
      fields: Object.entries(context).map(([key, value]) => ({
        name: key,
        value: String(value),
        inline: true,
      })),
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }

  /**
   * Send a custom embed
   */
  async sendCustomEmbed(title, description, color = 3447003, fields = []) {
    await this.sendEmbed({
      title: title,
      description: description,
      color: color,
      fields: fields,
      timestamp: new Date(),
      footer: {
        text: 'Wavelaunch Studio',
      },
    });
  }
}

module.exports = new DiscordService();
