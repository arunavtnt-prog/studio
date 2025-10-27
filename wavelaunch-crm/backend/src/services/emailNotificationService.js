/**
 * Email Notification Service
 *
 * Handles all onboarding kit email notifications including:
 * - Month unlocked notifications
 * - Revision request alerts
 * - Month completion congratulations
 * - Business plan upload confirmations
 */

const { getMonthName, getMonthDocuments } = require('../utils/documentTemplates');

class EmailNotificationService {
  constructor() {
    this.emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid';
    this.fromEmail = process.env.EMAIL_FROM || 'team@wavelaunchstudio.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Wavelaunch Studio';
    this.notificationsEnabled = process.env.SEND_EMAIL_NOTIFICATIONS !== 'false';

    // Initialize email client based on provider
    this.initializeEmailClient();
  }

  initializeEmailClient() {
    if (this.emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // Will integrate with SendGrid when API key is available
      this.sendgridClient = null; // require('@sendgrid/mail');
      console.log('✓ Email Notification Service initialized (SendGrid mode)');
    } else {
      console.log('⚠ Email notifications disabled - set SENDGRID_API_KEY to enable');
    }
  }

  /**
   * Send Month Unlocked Email
   */
  async sendMonthUnlockedEmail(clientData, monthNumber) {
    try {
      if (!this.notificationsEnabled) {
        console.log(`[Email] Skipped: Month ${monthNumber} unlocked for ${clientData.name} (notifications disabled)`);
        return { success: true, skipped: true };
      }

      const monthInfo = getMonthDocuments(monthNumber);
      const monthName = monthInfo?.name || `Month ${monthNumber}`;
      const documents = monthInfo?.documents || [];

      const subject = `🎉 Month ${monthNumber} Deliverables Ready - ${clientData.name}`;
      const html = this.buildMonthUnlockedHTML(clientData, monthNumber, monthName, documents);
      const text = this.buildMonthUnlockedText(clientData, monthNumber, monthName, documents);

      const emailData = {
        to: clientData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        html,
        text,
      };

      // Log email for now (will send when SendGrid is configured)
      console.log(`[Email] Month ${monthNumber} Unlocked: ${clientData.email}`);
      console.log(`Subject: ${subject}`);

      // TODO: Uncomment when SendGrid is configured
      // await this.sendgridClient.send(emailData);

      return {
        success: true,
        recipient: clientData.email,
        subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Error sending month unlocked email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  buildMonthUnlockedHTML(clientData, monthNumber, monthName, documents) {
    const firstName = clientData.name.split(' ')[0];
    const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${clientData.id}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .document-list { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .document-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .document-item:last-child { border-bottom: none; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .emoji { font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎉</div>
            <h1>Month ${monthNumber} Deliverables Ready!</h1>
            <p>${monthName}</p>
          </div>

          <div class="content">
            <p>Hi ${firstName},</p>

            <p><strong>Congratulations on completing Month ${monthNumber - 1}!</strong> 🎊</p>

            <p>Your Month ${monthNumber} deliverables are now ready and waiting for you in your dashboard.</p>

            <div class="document-list">
              <h3>Here's what's inside:</h3>
              ${documents.map((doc, i) => `
                <div class="document-item">
                  <strong>${i + 1}. ${doc.name}</strong>
                  <br>
                  <span style="color: #6b7280; font-size: 14px;">${doc.type} • ${doc.estimatedPages} pages</span>
                </div>
              `).join('')}
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review each document thoroughly</li>
              <li>Schedule a review call with your Wavelaunch strategist</li>
              <li>Request any revisions if needed</li>
              <li>Approve documents to unlock Month ${monthNumber + 1}</li>
            </ol>

            <div style="text-align: center;">
              <a href="${dashboardLink}" class="cta-button">View in Dashboard →</a>
            </div>

            <p>Questions? Reply to this email or book a call with your strategist.</p>

            <p>Let's keep building! 🚀</p>

            <p>
              Best,<br>
              <strong>The Wavelaunch Team</strong>
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavelaunch Studio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  buildMonthUnlockedText(clientData, monthNumber, monthName, documents) {
    const firstName = clientData.name.split(' ')[0];
    return `
Hi ${firstName},

Congratulations on completing Month ${monthNumber - 1}! 🎊

Your Month ${monthNumber} deliverables are now ready: "${monthName}"

Here's what's inside:
${documents.map((doc, i) => `${i + 1}. ${doc.name} (${doc.type})`).join('\n')}

Next Steps:
1. Review each document thoroughly
2. Schedule a review call with your Wavelaunch strategist
3. Request any revisions if needed
4. Approve documents to unlock Month ${monthNumber + 1}

View in your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${clientData.id}

Questions? Reply to this email or book a call.

Let's keep building! 🚀

The Wavelaunch Team
    `;
  }

  /**
   * Send Revision Requested Email (to Wavelaunch team)
   */
  async sendRevisionRequestedEmail(clientData, monthNumber, documentName, revisionNotes) {
    try {
      if (!this.notificationsEnabled) {
        console.log(`[Email] Skipped: Revision request for ${documentName} (notifications disabled)`);
        return { success: true, skipped: true };
      }

      const subject = `📝 Revision Request - ${documentName} - ${clientData.name}`;
      const html = this.buildRevisionRequestHTML(clientData, monthNumber, documentName, revisionNotes);
      const text = this.buildRevisionRequestText(clientData, monthNumber, documentName, revisionNotes);

      const emailData = {
        to: this.fromEmail, // Send to Wavelaunch team
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        html,
        text,
      };

      console.log(`[Email] Revision Request: ${documentName} for ${clientData.name}`);
      console.log(`Notes: ${revisionNotes}`);

      // TODO: Uncomment when SendGrid is configured
      // await this.sendgridClient.send(emailData);

      return {
        success: true,
        recipient: this.fromEmail,
        subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Error sending revision request email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  buildRevisionRequestHTML(clientData, monthNumber, documentName, revisionNotes) {
    const crmLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${clientData.id}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .revision-notes { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
          .client-info { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Revision Request</h1>
            <p>${documentName}</p>
          </div>

          <div class="content">
            <p><strong>${clientData.name}</strong> has requested a revision for:</p>
            <h3>${documentName}</h3>

            <div class="revision-notes">
              <h4>Revision Notes:</h4>
              <p>${revisionNotes}</p>
            </div>

            <div class="client-info">
              <p><strong>Client:</strong> ${clientData.name}</p>
              <p><strong>Email:</strong> ${clientData.email}</p>
              <p><strong>Month:</strong> ${monthNumber}</p>
              <p><strong>Document:</strong> ${documentName}</p>
            </div>

            <p><strong>Action Required:</strong></p>
            <ol>
              <li>Review the revision notes carefully</li>
              <li>Update the document accordingly</li>
              <li>Regenerate and notify the client</li>
            </ol>

            <div style="text-align: center;">
              <a href="${crmLink}" class="cta-button">View in CRM →</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  buildRevisionRequestText(clientData, monthNumber, documentName, revisionNotes) {
    return `
Revision Request from ${clientData.name}

Document: ${documentName}
Month: ${monthNumber}
Client Email: ${clientData.email}

Revision Notes:
"${revisionNotes}"

Action Required:
1. Review the revision notes carefully
2. Update the document accordingly
3. Regenerate and notify the client

View in CRM: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${clientData.id}
    `;
  }

  /**
   * Send Month Completed Email
   */
  async sendMonthCompletedEmail(clientData, monthNumber) {
    try {
      if (!this.notificationsEnabled) {
        console.log(`[Email] Skipped: Month ${monthNumber} completed for ${clientData.name} (notifications disabled)`);
        return { success: true, skipped: true };
      }

      const monthInfo = getMonthDocuments(monthNumber);
      const documents = monthInfo?.documents || [];
      const nextMonthInfo = getMonthDocuments(monthNumber + 1);

      const subject = `✅ Month ${monthNumber} Complete - ${clientData.name}!`;
      const html = this.buildMonthCompletedHTML(clientData, monthNumber, documents, nextMonthInfo);
      const text = this.buildMonthCompletedText(clientData, monthNumber, documents, nextMonthInfo);

      const emailData = {
        to: clientData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        html,
        text,
      };

      console.log(`[Email] Month ${monthNumber} Completed: ${clientData.email}`);

      // TODO: Uncomment when SendGrid is configured
      // await this.sendgridClient.send(emailData);

      return {
        success: true,
        recipient: clientData.email,
        subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Error sending month completed email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  buildMonthCompletedHTML(clientData, monthNumber, documents, nextMonthInfo) {
    const firstName = clientData.name.split(' ')[0];
    const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${clientData.id}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .checklist { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .checklist-item { padding: 8px 0; }
          .next-month { background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .emoji { font-size: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎯</div>
            <h1>Month ${monthNumber} Complete!</h1>
            <p>Amazing work, ${firstName}!</p>
          </div>

          <div class="content">
            <p>Hi ${firstName},</p>

            <p><strong>Congratulations!</strong> You've successfully completed Month ${monthNumber} of your brand transformation journey. 🎊</p>

            <div class="checklist">
              <h3>What You've Accomplished:</h3>
              ${documents.map((doc) => `
                <div class="checklist-item">✓ ${doc.name}</div>
              `).join('')}
            </div>

            ${nextMonthInfo ? `
              <div class="next-month">
                <h3>What's Next:</h3>
                <p><strong>${nextMonthInfo.name}</strong></p>
                <p>${nextMonthInfo.focus}</p>
                <p>Month ${monthNumber + 1} will unlock automatically, and you'll receive your next set of deliverables within 24 hours.</p>
              </div>
            ` : `
              <div class="next-month">
                <h3>🎉 Program Complete!</h3>
                <p>You've completed all 8 months of the Wavelaunch transformation program. Your brand is ready for the market!</p>
              </div>
            `}

            <p>Keep up the momentum! 💪</p>

            <div style="text-align: center;">
              <a href="${dashboardLink}" class="cta-button">View Dashboard →</a>
            </div>

            <p>
              Proud of your progress,<br>
              <strong>The Wavelaunch Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  buildMonthCompletedText(clientData, monthNumber, documents, nextMonthInfo) {
    const firstName = clientData.name.split(' ')[0];
    return `
Hi ${firstName},

Amazing work! You've completed Month ${monthNumber}. 🎯

Here's what you've accomplished:
${documents.map((doc) => `✓ ${doc.name}`).join('\n')}

${nextMonthInfo ? `
What's Next:
${nextMonthInfo.name}

Month ${monthNumber + 1} will unlock automatically, and you'll receive your next set of deliverables within 24 hours.
` : `
🎉 Program Complete!
You've completed all 8 months of the Wavelaunch transformation program. Your brand is ready for the market!
`}

Keep up the momentum! 💪

The Wavelaunch Team

View Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${clientData.id}
    `;
  }

  /**
   * Send Business Plan Upload Confirmation
   */
  async sendBusinessPlanUploadedEmail(clientData, parsedData) {
    try {
      if (!this.notificationsEnabled) {
        console.log(`[Email] Skipped: Business plan uploaded for ${clientData.name} (notifications disabled)`);
        return { success: true, skipped: true };
      }

      const subject = `📋 Business Plan Received - ${clientData.name}`;
      const html = this.buildBusinessPlanUploadedHTML(clientData, parsedData);
      const text = this.buildBusinessPlanUploadedText(clientData, parsedData);

      const emailData = {
        to: clientData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        html,
        text,
      };

      console.log(`[Email] Business Plan Uploaded: ${clientData.email}`);

      // TODO: Uncomment when SendGrid is configured
      // await this.sendgridClient.send(emailData);

      return {
        success: true,
        recipient: clientData.email,
        subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Error sending business plan uploaded email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  buildBusinessPlanUploadedHTML(clientData, parsedData) {
    const firstName = clientData.name.split(' ')[0];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .parsed-info { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Business Plan Received!</h1>
          </div>

          <div class="content">
            <p>Hi ${firstName},</p>

            <p>We've successfully received and processed your business plan. This information will help us create even more personalized and targeted deliverables for your brand.</p>

            ${parsedData ? `
              <div class="parsed-info">
                <h3>Extracted Information:</h3>
                <ul>
                  ${parsedData.productType ? `<li><strong>Product Type:</strong> ${parsedData.productType}</li>` : ''}
                  ${parsedData.targetRevenue?.softLaunch ? `<li><strong>Soft Launch Goal:</strong> $${parsedData.targetRevenue.softLaunch.toLocaleString()}</li>` : ''}
                  ${parsedData.targetRevenue?.fullLaunch ? `<li><strong>Full Launch Goal:</strong> $${parsedData.targetRevenue.fullLaunch.toLocaleString()}</li>` : ''}
                  ${parsedData.targetAudience?.demographics ? `<li><strong>Target Audience:</strong> ${parsedData.targetAudience.demographics}</li>` : ''}
                </ul>
              </div>
            ` : ''}

            <p>Your upcoming documents will now include insights and strategies tailored to your specific business plan.</p>

            <p>
              Best,<br>
              <strong>The Wavelaunch Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  buildBusinessPlanUploadedText(clientData, parsedData) {
    const firstName = clientData.name.split(' ')[0];
    return `
Hi ${firstName},

We've successfully received and processed your business plan.

${parsedData ? `
Extracted Information:
- Product Type: ${parsedData.productType || 'N/A'}
- Soft Launch Goal: $${parsedData.targetRevenue?.softLaunch?.toLocaleString() || 'N/A'}
- Full Launch Goal: $${parsedData.targetRevenue?.fullLaunch?.toLocaleString() || 'N/A'}
- Target Audience: ${parsedData.targetAudience?.demographics || 'N/A'}
` : ''}

Your upcoming documents will now include insights and strategies tailored to your specific business plan.

Best,
The Wavelaunch Team
    `;
  }
}

module.exports = new EmailNotificationService();
