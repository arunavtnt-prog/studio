/**
 * Business Plan Controller
 *
 * Handles business plan upload, parsing, and data extraction
 */

const { Client } = require('../models');
const businessPlanParser = require('../services/businessPlanParser');
const emailNotificationService = require('../services/emailNotificationService');
const slackService = require('../services/slackService');
const discordService = require('../services/discordService');
const webhookService = require('../services/webhookService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload and parse business plan
 * POST /api/v1/clients/:clientId/business-plan/upload
 */
exports.uploadBusinessPlan = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF, DOCX, or TXT file.',
      });
    }

    const file = req.file;
    console.log(`[BusinessPlan] Upload for client ${clientId}: ${file.originalname}`);

    // Get client
    const client = await Client.findByPk(clientId);
    if (!client) {
      // Clean up uploaded file
      await fs.unlink(file.path);
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Parse business plan with AI
    const parseResult = await businessPlanParser.parseBusinessPlan(file.path, file.originalname);

    if (!parseResult.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to parse business plan: ${parseResult.error}`,
      });
    }

    // Move file to permanent location
    const uploadsDir = process.env.UPLOADS_PATH || './uploads';
    const clientUploadsDir = path.join(uploadsDir, 'onboarding-kits', clientId, 'business-plan');

    // Ensure directory exists
    await fs.mkdir(clientUploadsDir, { recursive: true });

    const permanentPath = path.join(clientUploadsDir, `business-plan-${Date.now()}${path.extname(file.originalname)}`);
    await fs.rename(file.path, permanentPath);

    // Apply parsed data to client
    const updates = businessPlanParser.applyParsedDataToClient(client, parseResult.parsedData);

    // Update client record
    await client.update({
      ...updates,
      businessPlan: {
        uploaded: true,
        uploadedAt: new Date(),
        filePath: permanentPath,
        fileName: file.originalname,
        parsedData: parseResult.parsedData,
        lastUpdated: new Date(),
        extractedTextLength: parseResult.extractedTextLength,
      },
    });

    // Send confirmation email
    await emailNotificationService.sendBusinessPlanUploadedEmail(client, parseResult.parsedData);

    // Send Slack notification (async)
    slackService.notifyBusinessPlanUploaded(client.name, file.originalname).catch((error) => {
      console.error('Error sending Slack notification:', error);
    });

    // Send Discord notification (async)
    discordService.notifyBusinessPlanUploaded(client.name, file.originalname).catch((error) => {
      console.error('Error sending Discord notification:', error);
    });

    // Trigger webhooks (async)
    webhookService.triggerWebhook(client.id, 'business_plan.uploaded', {
      clientId: client.id,
      clientName: client.name,
      fileName: file.originalname,
      uploadedAt: new Date().toISOString(),
    }).catch((error) => {
      console.error('Error triggering webhooks:', error);
    });

    res.json({
      success: true,
      data: {
        fileName: file.originalname,
        uploadedAt: new Date(),
        parsedData: parseResult.parsedData,
        appliedToProfile: true,
      },
      message: 'Business plan uploaded and parsed successfully',
    });
  } catch (error) {
    console.error('Error uploading business plan:', error);

    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get business plan info
 * GET /api/v1/clients/:clientId/business-plan
 */
exports.getBusinessPlan = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    if (!client.businessPlan || !client.businessPlan.uploaded) {
      return res.json({
        success: true,
        data: {
          uploaded: false,
          message: 'No business plan uploaded yet',
        },
      });
    }

    res.json({
      success: true,
      data: {
        uploaded: true,
        uploadedAt: client.businessPlan.uploadedAt,
        fileName: client.businessPlan.fileName,
        parsedData: client.businessPlan.parsedData,
        lastUpdated: client.businessPlan.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Error getting business plan:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete business plan
 * DELETE /api/v1/clients/:clientId/business-plan
 */
exports.deleteBusinessPlan = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    if (!client.businessPlan || !client.businessPlan.uploaded) {
      return res.status(404).json({
        success: false,
        error: 'No business plan to delete',
      });
    }

    // Delete file if it exists
    if (client.businessPlan.filePath) {
      try {
        await fs.unlink(client.businessPlan.filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue even if file deletion fails
      }
    }

    // Update client record
    await client.update({
      businessPlan: {
        uploaded: false,
        uploadedAt: null,
        filePath: null,
        fileName: null,
        parsedData: null,
        lastUpdated: null,
      },
    });

    res.json({
      success: true,
      message: 'Business plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting business plan:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
