const axios = require('axios');

/**
 * Slack Service
 *
 * Sends real-time notifications to Slack channels for team updates.
 * Integrates with Wavelaunch onboarding workflow events.
 */
class SlackService {
  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl && process.env.SLACK_NOTIFICATIONS_ENABLED !== 'false';
  }

  /**
   * Send a notification to Slack
   */
  async sendNotification(message, channel = 'general') {
    if (!this.enabled) {
      console.log('[Slack] Notifications disabled or webhook not configured');
      return { success: false, reason: 'disabled' };
    }

    try {
      await axios.post(this.webhookUrl, {
        channel: `#${channel}`,
        username: 'Wavelaunch Bot',
        icon_emoji: ':rocket:',
        ...message,
      });

      console.log(`[Slack] Notification sent to #${channel}`);
      return { success: true };
    } catch (error) {
      console.error('[Slack] Notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify when a document is generated
   */
  async notifyDocumentGenerated(clientName, documentName, monthNumber) {
    await this.sendNotification(
      {
        text: `📄 *Document Generated*`,
        attachments: [
          {
            color: '#36a64f', // Green
            fields: [
              { title: 'Client', value: clientName, short: true },
              { title: 'Month', value: `Month ${monthNumber}`, short: true },
              { title: 'Document', value: documentName, short: false },
            ],
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      'onboarding-updates'
    );
  }

  /**
   * Notify when a revision is requested
   */
  async notifyRevisionRequested(clientName, documentName, monthNumber, revisionNotes) {
    await this.sendNotification(
      {
        text: `✏️ *Revision Requested*`,
        attachments: [
          {
            color: '#ff9900', // Orange
            fields: [
              { title: 'Client', value: clientName, short: true },
              { title: 'Month', value: `Month ${monthNumber}`, short: true },
              { title: 'Document', value: documentName, short: false },
              { title: 'Revision Notes', value: revisionNotes || 'No notes provided', short: false },
            ],
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      'revisions'
    );
  }

  /**
   * Notify when a month is completed
   */
  async notifyMonthCompleted(clientName, monthNumber) {
    await this.sendNotification(
      {
        text: `🎉 *Month ${monthNumber} Completed!*`,
        attachments: [
          {
            color: '#2eb886', // Dark green
            fields: [
              { title: 'Client', value: clientName, short: true },
              { title: 'Achievement', value: `Completed Month ${monthNumber} of 8`, short: true },
            ],
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      'milestones'
    );
  }

  /**
   * Notify when a document is approved
   */
  async notifyDocumentApproved(clientName, documentName, monthNumber) {
    await this.sendNotification(
      {
        text: `✅ *Document Approved*`,
        attachments: [
          {
            color: '#2eb886',
            fields: [
              { title: 'Client', value: clientName, short: true },
              { title: 'Month', value: `Month ${monthNumber}`, short: true },
              { title: 'Document', value: documentName, short: false },
            ],
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      'approvals'
    );
  }

  /**
   * Notify when business plan is uploaded
   */
  async notifyBusinessPlanUploaded(clientName, fileName) {
    await this.sendNotification(
      {
        text: `📋 *Business Plan Uploaded*`,
        attachments: [
          {
            color: '#3AA3E3', // Blue
            fields: [
              { title: 'Client', value: clientName, short: true },
              { title: 'File', value: fileName, short: true },
            ],
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      'onboarding-updates'
    );
  }

  /**
   * Notify when task is assigned
   */
  async notifyTaskAssigned(assignedTo, taskDescription, clientName, dueDate) {
    await this.sendNotification(
      {
        text: `📋 *New Task Assigned to @${assignedTo}*`,
        attachments: [
          {
            color: '#3AA3E3',
            fields: [
              { title: 'Task', value: taskDescription, short: false },
              { title: 'Client', value: clientName, short: true },
              { title: 'Due Date', value: new Date(dueDate).toLocaleDateString(), short: true },
            ],
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      'tasks'
    );
  }

  /**
   * Send a custom notification
   */
  async sendCustomNotification(title, message, color = '#3AA3E3', channel = 'general') {
    await this.sendNotification(
      {
        text: `*${title}*`,
        attachments: [
          {
            color: color,
            text: message,
            footer: 'Wavelaunch Studio',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      },
      channel
    );
  }
}

module.exports = new SlackService();
