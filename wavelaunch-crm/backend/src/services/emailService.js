const { google } = require('googleapis');
const { Email, Client, ActivityLog } = require('../models');
const llmService = require('./llmService');
require('dotenv').config();

/**
 * Email Service
 *
 * Handles Gmail API integration for:
 * - OAuth2 authentication
 * - Email syncing
 * - Email parsing
 * - Sentiment analysis
 * - Activity logging
 *
 * SETUP REQUIRED:
 * 1. Create Google Cloud Project
 * 2. Enable Gmail API
 * 3. Create OAuth 2.0 credentials
 * 4. Set up redirect URI
 * 5. Get refresh token using OAuth flow
 * 6. Add credentials to .env file
 */

class EmailService {
  constructor() {
    this.oauth2Client = null;
    this.gmail = null;
    this.initializeAuth();
  }

  /**
   * Initialize OAuth2 Client
   */
  initializeAuth() {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
      );

      if (process.env.GMAIL_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        });

        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        console.log('✓ Gmail API initialized');
      } else {
        console.warn('⚠ Gmail refresh token not found. Email sync will not work.');
      }
    } catch (error) {
      console.error('Error initializing Gmail auth:', error.message);
    }
  }

  /**
   * Get OAuth2 Authorization URL
   *
   * Use this to get the URL for initial OAuth flow.
   * User visits this URL, grants permission, and you get the auth code.
   *
   * @returns {string} Authorization URL
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange Authorization Code for Tokens
   *
   * After user authorizes, exchange the code for tokens.
   *
   * @param {string} code - Authorization code from OAuth callback
   * @returns {Promise<Object>} Tokens
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      console.log('✓ Tokens received. Add this refresh_token to .env:');
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);

      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  /**
   * Sync Emails for a Client
   *
   * Fetches recent emails for a client's email address.
   * Parses and stores them in the database.
   *
   * @param {string} clientId - Client UUID
   * @param {number} maxResults - Maximum emails to fetch (default: 50)
   * @returns {Promise<Object>} Sync results
   */
  async syncClientEmails(clientId, maxResults = 50) {
    try {
      if (!this.gmail) {
        throw new Error('Gmail API not initialized');
      }

      // Get client
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      console.log(`Syncing emails for ${client.name} (${client.email})`);

      // Build search query
      const query = `from:${client.email} OR to:${client.email}`;

      // Fetch message list
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} messages`);

      let syncedCount = 0;
      let skippedCount = 0;

      // Process each message
      for (const message of messages) {
        try {
          // Check if already synced
          const existing = await Email.findOne({
            where: { gmailMessageId: message.id },
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          // Fetch full message
          const fullMessage = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          // Parse message
          const parsedEmail = this.parseGmailMessage(fullMessage.data);

          // Analyze sentiment
          const sentimentResult = await llmService.analyzeEmailSentiment(
            parsedEmail.body,
            parsedEmail.subject
          );

          // Create email record
          await Email.create({
            clientId,
            gmailMessageId: message.id,
            threadId: parsedEmail.threadId,
            from: parsedEmail.from,
            to: parsedEmail.to,
            cc: parsedEmail.cc,
            subject: parsedEmail.subject,
            date: parsedEmail.date,
            body: parsedEmail.body,
            snippet: parsedEmail.snippet,
            isHtml: parsedEmail.isHtml,
            sentiment: sentimentResult.success ? sentimentResult.analysis.sentiment : null,
            sentimentLabel: sentimentResult.success ? sentimentResult.analysis.sentimentLabel : null,
            keyTopics: sentimentResult.success ? sentimentResult.analysis.keyTopics : [],
            urgency: sentimentResult.success ? sentimentResult.analysis.urgency : 'Medium',
            direction: parsedEmail.from.includes(client.email) ? 'Outgoing' : 'Incoming',
            category: sentimentResult.success ? sentimentResult.analysis.category : 'General',
            requiresAction: sentimentResult.success ? sentimentResult.analysis.requiresAction : false,
            hasAttachments: parsedEmail.hasAttachments,
            attachments: parsedEmail.attachments,
          });

          // Log activity
          await ActivityLog.create({
            entityType: 'Client',
            entityId: clientId,
            activityType: parsedEmail.from.includes(client.email) ? 'email_sent' : 'email_received',
            title: `Email: ${parsedEmail.subject}`,
            description: parsedEmail.snippet,
            metadata: {
              from: parsedEmail.from,
              subject: parsedEmail.subject,
              sentiment: sentimentResult.analysis?.sentimentLabel,
            },
            isAutomated: true,
            icon: 'email',
            importance: sentimentResult.analysis?.urgency === 'High' ? 'High' : 'Medium',
          });

          syncedCount++;
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error.message);
        }
      }

      // Update client's last email date
      await client.update({
        lastEmailDate: new Date(),
        lastTouchpoint: new Date(),
      });

      return {
        success: true,
        syncedCount,
        skippedCount,
        totalProcessed: messages.length,
      };
    } catch (error) {
      console.error('Error syncing emails:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse Gmail Message
   *
   * Extracts relevant information from Gmail API message object.
   *
   * @param {Object} message - Gmail message object
   * @returns {Object} Parsed email data
   */
  parseGmailMessage(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => {
      const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Extract body
    let body = '';
    let isHtml = false;

    const getBody = (payload) => {
      if (payload.body.data) {
        return {
          content: Buffer.from(payload.body.data, 'base64').toString('utf-8'),
          isHtml: payload.mimeType === 'text/html',
        };
      }

      if (payload.parts) {
        // Try to find text/plain first, then text/html
        const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
        const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');

        const part = textPart || htmlPart;
        if (part && part.body.data) {
          return {
            content: Buffer.from(part.body.data, 'base64').toString('utf-8'),
            isHtml: part.mimeType === 'text/html',
          };
        }
      }

      return { content: '', isHtml: false };
    };

    const bodyData = getBody(message.payload);
    body = bodyData.content;
    isHtml = bodyData.isHtml;

    // Extract attachments
    const attachments = [];
    const extractAttachments = (parts) => {
      if (!parts) return;

      parts.forEach((part) => {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId,
          });
        }

        if (part.parts) {
          extractAttachments(part.parts);
        }
      });
    };

    extractAttachments(message.payload.parts);

    return {
      threadId: message.threadId,
      from: getHeader('From'),
      to: getHeader('To')
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e),
      cc: getHeader('Cc')
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e),
      subject: getHeader('Subject'),
      date: new Date(parseInt(message.internalDate)),
      body,
      snippet: message.snippet,
      isHtml,
      hasAttachments: attachments.length > 0,
      attachments,
    };
  }

  /**
   * Sync All Active Clients
   *
   * Background job to sync emails for all active clients.
   * Should be run periodically (e.g., every 30 minutes).
   *
   * @returns {Promise<Object>} Sync summary
   */
  async syncAllClients() {
    try {
      const activeClients = await Client.findAll({
        where: { status: 'Active' },
      });

      console.log(`Starting email sync for ${activeClients.length} active clients`);

      const results = {
        totalClients: activeClients.length,
        successful: 0,
        failed: 0,
        totalSynced: 0,
      };

      for (const client of activeClients) {
        const result = await this.syncClientEmails(client.id, 20);

        if (result.success) {
          results.successful++;
          results.totalSynced += result.syncedCount;
        } else {
          results.failed++;
        }

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log('Email sync completed:', results);
      return results;
    } catch (error) {
      console.error('Error syncing all clients:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
