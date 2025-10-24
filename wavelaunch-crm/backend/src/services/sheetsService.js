const { google } = require('googleapis');
const { Lead, ActivityLog } = require('../models');
const llmService = require('./llmService');
require('dotenv').config();

/**
 * Google Sheets Sync Service
 *
 * Automatically syncs creator applications from Google Sheets to CRM.
 * Runs on server start and on a schedule (configurable).
 *
 * SETUP:
 * 1. Create Google Cloud Project
 * 2. Enable Google Sheets API
 * 3. Create Service Account
 * 4. Download credentials JSON
 * 5. Share your Google Sheet with the service account email
 * 6. Add credentials to .env
 *
 * FIELD MAPPING:
 * Intelligently maps your Tally form fields to Lead model.
 * Customize mapping in mapSheetRowToLead() function.
 */

class SheetsService {
  constructor() {
    this.sheets = null;
    this.syncLog = [];
    this.lastSyncTime = null;
    this.initializeAuth();
  }

  /**
   * Initialize Google Sheets API
   */
  initializeAuth() {
    try {
      // Option 1: Service Account (recommended for automation)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        console.log('✓ Google Sheets API initialized (Service Account)');
      }
      // Option 2: API Key (simpler, read-only on public sheets)
      else if (process.env.GOOGLE_SHEETS_API_KEY) {
        this.sheets = google.sheets({
          version: 'v4',
          auth: process.env.GOOGLE_SHEETS_API_KEY,
        });
        console.log('✓ Google Sheets API initialized (API Key)');
      } else {
        console.warn('⚠ Google Sheets credentials not found. Sync will not work.');
        console.warn('Add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to .env');
      }
    } catch (error) {
      console.error('Error initializing Google Sheets:', error.message);
    }
  }

  /**
   * Map Google Sheet Row to Lead Object
   *
   * Maps your Tally form columns to the Lead model.
   * Customize this function to match your exact column structure.
   *
   * @param {Array} headers - Column headers from sheet
   * @param {Array} row - Row data
   * @returns {Object} Mapped lead data
   */
  mapSheetRowToLead(headers, row) {
    const data = {};
    headers.forEach((header, index) => {
      data[header] = row[index] || '';
    });

    // Extract basic fields
    const lead = {
      name: data['Your Full Name'] || data['Name'] || data['Full Name'] || '',
      email: data['Email'] || data['Email Address'] || '',
      phone: data['Phone'] || data['Phone Number'] || null,

      // Determine niche from the application
      niche: data['Do you have a specific industry or niche in mind for the businesses you plan to build with us?'] ||
             data['Niche'] ||
             'To be determined',

      // Store timestamp
      appliedAt: data['Timestamp'] ? new Date(data['Timestamp']) : new Date(),

      // All form answers stored in customFormAnswers
      customFormAnswers: {
        // Professional background
        careerMilestones: data['Share with us the significant milestones that have shaped your professional career history, if any.'] || '',
        careerTurningPoints: data['Tell us about the main turning points in the history of your personal career. (If any)'] || '',

        // Vision & Strategy
        vision: data['What is your vision for this venture? What do you hope to achieve?'] || '',
        niche: data['Do you have a specific industry or niche in mind for the businesses you plan to build with us?'] || '',

        // Target Audience
        targetAudience: data['Who do you envision as the target audience for the businesses you plan to build with us?'] || '',
        demographics: data['Can you provide any details about the demographic profile of your target audience (gender, location, interests, etc.)?'] || '',
        targetAge: data['How old is your target demographic?'] || '',
        audienceGender: data['Is your audience primarily male or female?'] || '',
        audienceMaritalStatus: data['Are they married or single?'] || '',
        painPoints: data['What are the key needs and pain points of your target audience that you aim to address through your brand?'] || '',
        audienceSource: data['How does your current audience base find and learn about your social media profile?'] || '',

        // Competitive Positioning
        differentiation: data['How are you hoping to set your venture apart from the competition?'] || '',
        valueProposition: data['What unique value proposition (USPs) do you intend to offer to your customers?'] || '',
        competitors: data['Are there any emerging or disruptive competitors in your industry that you are closely monitoring?'] || '',

        // Branding
        brandImage: data['How would you describe the ideal brand image for your business?'] || '',
        brandInspiration: data['Are there any specific influencers or brands that you admire or would like to use as inspiration for your own brand?'] || '',
        brandAesthetics: data['Do you have any specific preferences or requirements in terms of branding aesthetics, visual identity, or tone of voice?'] || '',
        brandEmotions: data['What emotions or adjectives would you like your brand to evoke in their target audience?'] || '',
        brandPersonality: data['If your brand were a person, which of the following word groups would best describe them?'] || '',
        fontPreference: data['Last question in this section. If you had to choose one of these fonts for your brand, which would you choose?'] || '',
        brandValues: data['Are there any particular values or principles that are important for your brand to embody and communicate to your audience?'] || '',

        // Growth & Scaling
        scalingGoals: data['Do you have any of your own goals for scaling the business?'] || '',
        growthStrategies: data['Are there any specific strategies or channels you want to explore for brand growth and customer acquisition?'] || '',
        longTermVision: data['How do you envision your brand evolving in the long term?'] || '',

        // Additional Info
        additionalInfo: data['Is there any other relevant information that you think we should know before proceeding with the development process?'] || '',
        deadlines: data['Do you have any specific deadlines or milestones that we need to consider?'] || '',
      },

      // Initial stage
      stage: 'Warm',
      source: 'Google Sheets - Tally Form',

      // Priority based on how complete the application is
      priority: this.calculatePriority(data),
    };

    return lead;
  }

  /**
   * Calculate Priority Based on Application Completeness
   */
  calculatePriority(data) {
    const importantFields = [
      'What is your vision for this venture? What do you hope to achieve?',
      'Do you have a specific industry or niche in mind for the businesses you plan to build with us?',
      'Who do you envision as the target audience for the businesses you plan to build with us?',
      'What are the key needs and pain points of your target audience that you aim to address through your brand?',
      'How are you hoping to set your venture apart from the competition?',
    ];

    const filledCount = importantFields.filter(field => data[field] && data[field].length > 50).length;
    const completionRate = filledCount / importantFields.length;

    if (completionRate >= 0.8) return 'High';
    if (completionRate >= 0.5) return 'Medium';
    return 'Low';
  }

  /**
   * Sync Leads from Google Sheet
   *
   * @param {string} spreadsheetId - Google Sheet ID
   * @param {string} range - Sheet range (e.g., "Sheet1!A:Z")
   * @param {boolean} autoAnalyze - Run AI analysis on new leads
   * @returns {Promise<Object>} Sync results
   */
  async syncFromSheet(spreadsheetId, range = 'Sheet1!A:Z', autoAnalyze = true) {
    try {
      if (!this.sheets) {
        throw new Error('Google Sheets API not initialized');
      }

      console.log(`\n📊 Starting Google Sheets sync...`);
      console.log(`Sheet ID: ${spreadsheetId}`);
      console.log(`Range: ${range}`);

      const startTime = Date.now();
      const results = {
        totalRows: 0,
        newLeads: 0,
        duplicates: 0,
        errors: 0,
        analyzed: 0,
        leads: [],
      };

      // Fetch data from sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in sheet');
        return results;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      results.totalRows = dataRows.length;

      console.log(`Found ${dataRows.length} rows to process`);

      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];

          // Map row to lead object
          const leadData = this.mapSheetRowToLead(headers, row);

          // Skip if no email
          if (!leadData.email) {
            console.log(`⚠ Row ${i + 2}: Skipping (no email)`);
            continue;
          }

          // Check for duplicate by email
          const existing = await Lead.findOne({
            where: { email: leadData.email },
          });

          if (existing) {
            console.log(`⚠ Row ${i + 2}: Duplicate (${leadData.email})`);
            results.duplicates++;
            continue;
          }

          // Create lead
          const lead = await Lead.create(leadData);
          results.newLeads++;
          results.leads.push(lead);

          console.log(`✓ Row ${i + 2}: Created lead for ${leadData.name}`);

          // Auto-analyze with AI
          if (autoAnalyze) {
            try {
              const analysis = await llmService.analyzeLeadApplication(lead.toJSON());

              if (analysis.success) {
                await lead.update({
                  aiSummary: analysis.analysis.summary,
                  sentimentScore: analysis.analysis.sentiment,
                  fitScore: analysis.analysis.fitScore,
                  aiAnalysis: analysis.analysis,
                });
                results.analyzed++;
                console.log(`  ✓ AI Analysis: Fit Score ${analysis.analysis.fitScore}/100`);
              }
            } catch (error) {
              console.log(`  ⚠ AI Analysis failed: ${error.message}`);
            }
          }

          // Log activity
          await ActivityLog.create({
            entityType: 'Lead',
            entityId: lead.id,
            activityType: 'lead_imported',
            title: `Imported from Google Sheets`,
            description: `Application synced from Tally form`,
            metadata: {
              source: 'Google Sheets',
              spreadsheetId,
              rowNumber: i + 2,
            },
            isAutomated: true,
            icon: 'download',
            importance: 'Medium',
          });

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`✗ Row ${i + 2}: Error - ${error.message}`);
          results.errors++;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n✅ Sync completed in ${duration}s`);
      console.log(`   New leads: ${results.newLeads}`);
      console.log(`   Duplicates: ${results.duplicates}`);
      console.log(`   Analyzed: ${results.analyzed}`);
      console.log(`   Errors: ${results.errors}`);

      // Update sync log
      this.lastSyncTime = new Date();
      this.syncLog.push({
        timestamp: this.lastSyncTime,
        spreadsheetId,
        results,
        duration,
      });

      // Keep only last 50 sync logs
      if (this.syncLog.length > 50) {
        this.syncLog = this.syncLog.slice(-50);
      }

      return results;

    } catch (error) {
      console.error('Error syncing from Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Get Sync Status
   */
  getSyncStatus() {
    return {
      lastSyncTime: this.lastSyncTime,
      recentSyncs: this.syncLog.slice(-10),
      isConfigured: !!this.sheets,
    };
  }

  /**
   * Test Connection
   */
  async testConnection(spreadsheetId) {
    try {
      if (!this.sheets) {
        throw new Error('Google Sheets API not initialized');
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'properties.title',
      });

      return {
        success: true,
        title: response.data.properties.title,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new SheetsService();
