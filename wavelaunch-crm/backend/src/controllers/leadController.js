const { Lead, ActivityLog } = require('../models');
const llmService = require('../services/llmService');
const { Op } = require('sequelize');
const xlsx = require('exceljs');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

/**
 * Lead Controller
 *
 * Handles all lead-related operations:
 * - Creating new applications
 * - Analyzing applications with AI
 * - Managing lead pipeline
 * - Converting to clients
 */

const leadController = {
  /**
   * Create New Lead Application
   * POST /api/v1/leads
   */
  async createLead(req, res) {
    try {
      const leadData = req.body;

      // Create lead
      const lead = await Lead.create(leadData);

      // Auto-analyze if enabled
      if (leadData.autoAnalyze !== false) {
        const analysis = await llmService.analyzeLeadApplication(lead.toJSON());

        if (analysis.success) {
          await lead.update({
            aiSummary: analysis.analysis.summary,
            sentimentScore: analysis.analysis.sentiment,
            fitScore: analysis.analysis.fitScore,
            aiAnalysis: analysis.analysis,
          });
        }
      }

      // Log activity
      await ActivityLog.create({
        entityType: 'Lead',
        entityId: lead.id,
        activityType: 'lead_created',
        title: `New application from ${lead.name}`,
        description: lead.summary?.substring(0, 200),
        isAutomated: false,
        icon: 'user-plus',
        importance: 'High',
      });

      res.status(201).json({
        success: true,
        data: await Lead.findByPk(lead.id),
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get All Leads
   * GET /api/v1/leads
   */
  async getLeads(req, res) {
    try {
      const { stage, priority, search, sortBy = 'createdAt', order = 'DESC', limit = 50 } = req.query;

      const where = {};

      if (stage) where.stage = stage;
      if (priority) where.priority = priority;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { niche: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const leads = await Lead.findAll({
        where,
        order: [[sortBy, order]],
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        data: leads,
        count: leads.length,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Single Lead
   * GET /api/v1/leads/:id
   */
  async getLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findByPk(id, {
        include: [
          {
            model: ActivityLog,
            as: 'activityLogs',
            limit: 20,
            order: [['createdAt', 'DESC']],
          },
        ],
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Update Lead
   * PATCH /api/v1/leads/:id
   */
  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      await lead.update(updates);

      // Log stage changes
      if (updates.stage && updates.stage !== lead.stage) {
        await ActivityLog.create({
          entityType: 'Lead',
          entityId: lead.id,
          activityType: 'stage_changed',
          title: `Stage changed to ${updates.stage}`,
          description: `Lead moved from ${lead.stage} to ${updates.stage}`,
          isAutomated: false,
          icon: 'arrow-right',
          importance: 'Medium',
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Analyze Lead with AI
   * POST /api/v1/leads/:id/analyze
   */
  async analyzeLead(req, res) {
    try {
      const { id } = req.params;
      const { guidelines } = req.body;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      const analysis = await llmService.analyzeLeadApplication(lead.toJSON(), guidelines);

      if (!analysis.success) {
        return res.status(500).json({
          success: false,
          error: 'Analysis failed',
        });
      }

      await lead.update({
        aiSummary: analysis.analysis.summary,
        sentimentScore: analysis.analysis.sentiment,
        fitScore: analysis.analysis.fitScore,
        aiAnalysis: analysis.analysis,
      });

      res.json({
        success: true,
        data: lead,
        analysis: analysis.analysis,
      });
    } catch (error) {
      console.error('Error analyzing lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Delete Lead
   * DELETE /api/v1/leads/:id
   */
  async deleteLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
      }

      await lead.destroy();

      res.json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Import Leads from CSV/Excel
   * POST /api/v1/leads/import
   *
   * Accepts: CSV or Excel file
   * Expected columns: name, email, phone, niche, followers, engagement, platforms, stage, priority
   */
  async importLeads(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded. Please upload a CSV or Excel file.',
        });
      }

      const file = req.file;
      const fileExtension = file.originalname.split('.').pop().toLowerCase();

      let leads = [];

      // Parse CSV
      if (fileExtension === 'csv') {
        leads = await parseCSV(file.path);
      }
      // Parse Excel
      else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        leads = await parseExcel(file.path);
      }
      else {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          error: 'Invalid file type. Please upload a CSV or Excel file.',
        });
      }

      // Validate and create leads
      const results = {
        success: [],
        errors: [],
        total: leads.length,
      };

      for (let i = 0; i < leads.length; i++) {
        const leadData = leads[i];

        try {
          // Validate required fields
          if (!leadData.name || !leadData.email) {
            results.errors.push({
              row: i + 2, // +2 because row 1 is header and arrays are 0-indexed
              error: 'Missing required fields (name, email)',
              data: leadData,
            });
            continue;
          }

          // Check if lead already exists
          const existing = await Lead.findOne({ where: { email: leadData.email } });
          if (existing) {
            results.errors.push({
              row: i + 2,
              error: 'Lead with this email already exists',
              email: leadData.email,
            });
            continue;
          }

          // Parse platforms if it's a string
          if (typeof leadData.platforms === 'string') {
            leadData.platforms = leadData.platforms.split(',').map(p => p.trim());
          }

          // Create lead
          const lead = await Lead.create({
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || null,
            niche: leadData.niche || null,
            followers: parseInt(leadData.followers) || 0,
            engagement: parseFloat(leadData.engagement) || 0,
            platforms: Array.isArray(leadData.platforms) ? leadData.platforms : [],
            stage: leadData.stage || 'Warm',
            priority: leadData.priority || 'Medium',
            summary: leadData.summary || leadData.notes || null,
          });

          results.success.push({
            row: i + 2,
            leadId: lead.id,
            name: lead.name,
            email: lead.email,
          });

          // Log activity
          await ActivityLog.create({
            entityType: 'Lead',
            entityId: lead.id,
            activityType: 'lead_created',
            title: `Lead imported: ${lead.name}`,
            description: 'Created via CSV/Excel import',
            isAutomated: true,
            icon: 'upload',
            importance: 'Medium',
          });
        } catch (error) {
          results.errors.push({
            row: i + 2,
            error: error.message,
            data: leadData,
          });
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.json({
        success: true,
        message: `Import complete. ${results.success.length} leads imported, ${results.errors.length} errors.`,
        results,
      });
    } catch (error) {
      console.error('Error importing leads:', error);

      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Download Lead Import Template
   * GET /api/v1/leads/import/template
   *
   * Returns: CSV template file
   */
  async downloadTemplate(req, res) {
    try {
      const template = `name,email,phone,niche,followers,engagement,platforms,stage,priority,summary
John Doe,john@example.com,+1-555-0123,Fitness,50000,4.5,"instagram,tiktok",Warm,High,Fitness coach interested in launching digital product
Jane Smith,jane@example.com,+1-555-0124,Beauty,120000,5.2,"youtube,instagram",Interested,High,Beauty influencer ready to scale brand
`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=lead-import-template.csv');
      res.send(template);
    } catch (error) {
      console.error('Error generating template:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

/**
 * Helper: Parse CSV file
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const leads = [];
    const stream = fs.createReadStream(filePath);

    stream
      .pipe(csvParser())
      .on('data', (row) => {
        leads.push(row);
      })
      .on('end', () => {
        resolve(leads);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Helper: Parse Excel file
 */
async function parseExcel(filePath) {
  const workbook = new xlsx.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0]; // Get first sheet
  const leads = [];

  const headers = [];
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.value);
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const leadData = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      leadData[header] = cell.value;
    });

    leads.push(leadData);
  });

  return leads;
}

module.exports = leadController;
