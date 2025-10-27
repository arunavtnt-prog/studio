/**
 * Onboarding Kit Controller
 *
 * Handles all API requests related to the 8-month onboarding program
 * including document generation, status tracking, and progress management.
 */

const { Client } = require('../models');
const onboardingKitGenerator = require('../services/onboardingKitGenerator');
const emailNotificationService = require('../services/emailNotificationService');
const analyticsService = require('../services/analyticsService');
const slackService = require('../services/slackService');
const discordService = require('../services/discordService');
const webhookService = require('../services/webhookService');
const {
  getMonthDocuments,
  getDocument,
  getDocumentName,
  getAllMonths,
  getTotalDocuments,
} = require('../utils/documentTemplates');

/**
 * Generate all documents for a specific month
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/generate
 */
exports.generateMonthDocuments = async (req, res) => {
  try {
    const { clientId, monthNumber } = req.params;
    const month = parseInt(monthNumber);

    // Validate month number
    if (month < 1 || month > 8) {
      return res.status(400).json({
        success: false,
        error: 'Month number must be between 1 and 8',
      });
    }

    // Get client
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Check if month is unlocked (Month 1 is always unlocked)
    const monthProgress = client.monthProgress || {};
    const monthKey = `month${month}`;
    if (month > 1 && monthProgress[monthKey]?.status === 'locked') {
      return res.status(403).json({
        success: false,
        error: `Month ${month} is locked. Complete Month ${month - 1} first.`,
      });
    }

    // Generate all documents for the month
    console.log(`Generating all Month ${month} documents for client: ${client.name}`);

    // Track generation start
    const startTime = Date.now();

    const result = await onboardingKitGenerator.generateMonthDocuments(client, month);

    if (!result.success) {
      // Track generation failure
      analyticsService.trackEvent({
        eventType: 'document_generation_failed',
        clientId: client.id,
        monthNumber: month,
        success: false,
        errorMessage: result.error,
        durationMs: Date.now() - startTime,
      });

      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    // Track generation completion for each document
    const duration = Date.now() - startTime;
    result.documents.forEach((doc) => {
      analyticsService.trackEvent({
        eventType: 'document_generation_completed',
        clientId: client.id,
        monthNumber: month,
        documentNumber: doc.docNumber || 1,
        documentName: doc.name,
        durationMs: duration / result.documents.length,
        tokensUsed: doc.tokensUsed,
        llmProvider: doc.provider,
        success: true,
      });
    });

    // Update client's onboardingKits data
    const onboardingKits = client.onboardingKits || {};
    onboardingKits[monthKey] = {
      generated: true,
      generatedAt: new Date(),
      documents: result.documents.map((doc) => ({
        name: doc.name,
        fileName: doc.fileName,
        filePath: doc.filePath,
        status: 'generated',
        generatedAt: doc.generatedAt,
        sentAt: null,
        viewedAt: null,
        acknowledgedAt: null,
        approvedAt: null,
        revisionRequested: false,
        revisionNotes: null,
        version: 1,
        tokensUsed: doc.tokensUsed,
        provider: doc.provider,
        model: doc.model,
      })),
    };

    // Update client
    await client.update({
      onboardingKits,
      onboardingKitGenerated: true, // Legacy field
    });

    // Send email notification (async, don't wait for it)
    emailNotificationService.sendMonthUnlockedEmail(client, month).catch((error) => {
      console.error('Error sending month unlocked email:', error);
    });

    // Send Slack notification (async)
    result.documents.forEach((doc) => {
      slackService.notifyDocumentGenerated(client.name, doc.name, month).catch((error) => {
        console.error('Error sending Slack notification:', error);
      });
    });

    // Send Discord notification (async)
    result.documents.forEach((doc) => {
      discordService.notifyDocumentGenerated(client.name, doc.name, month).catch((error) => {
        console.error('Error sending Discord notification:', error);
      });
    });

    // Trigger webhooks (async)
    webhookService.triggerWebhook(client.id, 'documents.generated', {
      clientId: client.id,
      clientName: client.name,
      monthNumber: month,
      documentsCount: result.generatedCount,
      documents: result.documents.map(d => ({ name: d.name, status: 'generated' })),
    }).catch((error) => {
      console.error('Error triggering webhooks:', error);
    });

    res.json({
      success: true,
      data: {
        month,
        generatedCount: result.generatedCount,
        totalCount: result.totalCount,
        documents: result.documents,
        errors: result.errors,
      },
      message: `Successfully generated ${result.generatedCount} of ${result.totalCount} documents for Month ${month}`,
    });
  } catch (error) {
    console.error('Error generating month documents:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Generate a single document
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/generate
 */
exports.generateSingleDocument = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    // Validate
    if (month < 1 || month > 8) {
      return res.status(400).json({
        success: false,
        error: 'Month number must be between 1 and 8',
      });
    }
    if (doc < 1 || doc > 5) {
      return res.status(400).json({
        success: false,
        error: 'Document number must be between 1 and 5',
      });
    }

    // Get client
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Generate document
    console.log(`Generating Month ${month}, Doc ${doc} for client: ${client.name}`);
    const result = await onboardingKitGenerator.generateDocument(client, month, doc);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    // Update client's onboardingKits data
    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;

    if (!onboardingKits[monthKey]) {
      onboardingKits[monthKey] = {
        generated: false,
        generatedAt: null,
        documents: [],
      };
    }

    // Find or create document entry
    const docIndex = onboardingKits[monthKey].documents.findIndex(
      (d) => d.name === result.document.name
    );

    const documentData = {
      name: result.document.name,
      fileName: result.document.fileName,
      filePath: result.document.filePath,
      status: 'generated',
      generatedAt: result.document.generatedAt,
      sentAt: null,
      viewedAt: null,
      acknowledgedAt: null,
      approvedAt: null,
      revisionRequested: false,
      revisionNotes: null,
      version: docIndex >= 0 ? (onboardingKits[monthKey].documents[docIndex].version || 1) + 1 : 1,
      tokensUsed: result.document.tokensUsed,
      provider: result.document.provider,
      model: result.document.model,
    };

    if (docIndex >= 0) {
      onboardingKits[monthKey].documents[docIndex] = documentData;
    } else {
      onboardingKits[monthKey].documents.push(documentData);
    }

    // Check if all 5 documents are now generated
    if (onboardingKits[monthKey].documents.length === 5) {
      onboardingKits[monthKey].generated = true;
      onboardingKits[monthKey].generatedAt = new Date();
    }

    await client.update({ onboardingKits });

    res.json({
      success: true,
      data: result.document,
      message: `Successfully generated ${result.document.name}`,
    });
  } catch (error) {
    console.error('Error generating single document:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all documents for a specific month
 * GET /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber
 */
exports.getMonthDocuments = async (req, res) => {
  try {
    const { clientId, monthNumber } = req.params;
    const month = parseInt(monthNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;
    const monthData = onboardingKits[monthKey] || {
      generated: false,
      generatedAt: null,
      documents: [],
    };

    // Get month template info
    const monthTemplate = getMonthDocuments(month);

    res.json({
      success: true,
      data: {
        month,
        monthName: monthTemplate?.name || `Month ${month}`,
        monthFocus: monthTemplate?.focus || '',
        ...monthData,
        templateDocuments: monthTemplate?.documents || [],
      },
    });
  } catch (error) {
    console.error('Error getting month documents:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a single document (with content)
 * GET /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber
 */
exports.getSingleDocument = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Get document metadata from client
    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;
    const monthData = onboardingKits[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: 'Document not generated yet',
      });
    }

    const documentTemplate = getDocument(month, doc);
    const documentMeta = monthData.documents.find((d) => d.name === documentTemplate.name);

    if (!documentMeta) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Read document content from file
    const fileResult = await onboardingKitGenerator.readDocument(clientId, month, doc);

    if (!fileResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Document file not found',
      });
    }

    // Mark as viewed if not already
    if (!documentMeta.viewedAt) {
      documentMeta.viewedAt = new Date();
      if (documentMeta.status === 'generated' || documentMeta.status === 'sent') {
        documentMeta.status = 'viewed';
      }
      await client.update({ onboardingKits });

      // Track document view
      analyticsService.trackEvent({
        eventType: 'document_viewed',
        clientId: client.id,
        monthNumber: month,
        documentNumber: doc,
        documentName: documentMeta.name,
        success: true,
      });
    }

    res.json({
      success: true,
      data: {
        ...documentMeta,
        content: fileResult.content,
        size: fileResult.size,
        createdAt: fileResult.createdAt,
        modifiedAt: fileResult.modifiedAt,
      },
    });
  } catch (error) {
    console.error('Error getting single document:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update document status
 * PUT /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/status
 */
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const { status } = req.body;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const validStatuses = ['generated', 'sent', 'viewed', 'revision-requested', 'approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;
    const monthData = onboardingKits[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    const documentTemplate = getDocument(month, doc);
    const documentMeta = monthData.documents.find((d) => d.name === documentTemplate.name);

    if (!documentMeta) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Update status and timestamp
    documentMeta.status = status;

    if (status === 'sent' && !documentMeta.sentAt) {
      documentMeta.sentAt = new Date();
    }
    if (status === 'viewed' && !documentMeta.viewedAt) {
      documentMeta.viewedAt = new Date();
    }
    if (status === 'approved') {
      documentMeta.approvedAt = new Date();
      documentMeta.acknowledgedAt = new Date();
    }

    await client.update({ onboardingKits });

    // Check if all documents in the month are approved
    const allApproved = monthData.documents.every((d) => d.status === 'approved');
    if (allApproved && status === 'approved') {
      // Update month progress
      const monthProgress = client.monthProgress || {};
      monthProgress[monthKey] = {
        status: 'completed',
        completedAt: new Date(),
        approvedAt: new Date(),
        unlockedAt: monthProgress[monthKey]?.unlockedAt || new Date(),
      };

      // Unlock next month if not Month 8
      if (month < 8) {
        const nextMonthKey = `month${month + 1}`;
        monthProgress[nextMonthKey] = {
          status: 'active',
          completedAt: null,
          approvedAt: null,
          unlockedAt: new Date(),
        };
      }

      // Add to completed months
      const completedMonths = client.completedMonths || [];
      if (!completedMonths.includes(month)) {
        completedMonths.push(month);
      }

      await client.update({
        monthProgress,
        completedMonths,
        currentMonth: month < 8 ? month + 1 : 8,
      });
    }

    res.json({
      success: true,
      data: documentMeta,
      message: `Document status updated to: ${status}`,
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Request revision
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/revision
 */
exports.requestRevision = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const { notes } = req.body;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;
    const monthData = onboardingKits[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    const documentTemplate = getDocument(month, doc);
    const documentMeta = monthData.documents.find((d) => d.name === documentTemplate.name);

    if (!documentMeta) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    documentMeta.status = 'revision-requested';
    documentMeta.revisionRequested = true;
    documentMeta.revisionNotes = notes || '';

    await client.update({ onboardingKits });

    // Track revision request
    analyticsService.trackEvent({
      eventType: 'document_revision_requested',
      clientId: client.id,
      monthNumber: month,
      documentNumber: doc,
      documentName: documentMeta.name,
      metadata: { revisionNotes: notes },
      success: true,
    });

    // Send email notification to Wavelaunch team (async)
    emailNotificationService.sendRevisionRequestedEmail(client, month, documentTemplate.name, notes).catch((error) => {
      console.error('Error sending revision request email:', error);
    });

    // Send Slack notification (async)
    slackService.notifyRevisionRequested(client.name, documentTemplate.name, month, notes).catch((error) => {
      console.error('Error sending Slack notification:', error);
    });

    // Send Discord notification (async)
    discordService.notifyRevisionRequested(client.name, documentTemplate.name, month, notes).catch((error) => {
      console.error('Error sending Discord notification:', error);
    });

    // Trigger webhooks (async)
    webhookService.triggerWebhook(client.id, 'document.revision_requested', {
      clientId: client.id,
      clientName: client.name,
      monthNumber: month,
      documentName: documentTemplate.name,
      revisionNotes: notes,
    }).catch((error) => {
      console.error('Error triggering webhooks:', error);
    });

    res.json({
      success: true,
      data: documentMeta,
      message: 'Revision request submitted',
    });
  } catch (error) {
    console.error('Error requesting revision:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Approve document
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/approve
 */
exports.approveDocument = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const doc = parseInt(docNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;
    const monthData = onboardingKits[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    const documentTemplate = getDocument(month, doc);
    const documentMeta = monthData.documents.find((d) => d.name === documentTemplate.name);

    if (!documentMeta) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    documentMeta.status = 'approved';
    documentMeta.approvedAt = new Date();
    documentMeta.acknowledgedAt = new Date();
    documentMeta.revisionRequested = false;

    await client.update({ onboardingKits });

    // Track document approval
    analyticsService.trackEvent({
      eventType: 'document_approved',
      clientId: client.id,
      monthNumber: month,
      documentNumber: doc,
      documentName: documentMeta.name,
      success: true,
    });

    // Send Slack notification (async)
    slackService.notifyDocumentApproved(client.name, documentMeta.name, month).catch((error) => {
      console.error('Error sending Slack notification:', error);
    });

    // Send Discord notification (async)
    discordService.notifyDocumentApproved(client.name, documentMeta.name, month).catch((error) => {
      console.error('Error sending Discord notification:', error);
    });

    // Trigger webhooks (async)
    webhookService.triggerWebhook(client.id, 'document.approved', {
      clientId: client.id,
      clientName: client.name,
      monthNumber: month,
      documentName: documentMeta.name,
    }).catch((error) => {
      console.error('Error triggering webhooks:', error);
    });

    // Check if all documents approved -> update month completion
    const allApproved = monthData.documents.every((d) => d.status === 'approved');
    if (allApproved) {
      const monthProgress = client.monthProgress || {};
      monthProgress[monthKey] = {
        status: 'completed',
        completedAt: new Date(),
        approvedAt: new Date(),
        unlockedAt: monthProgress[monthKey]?.unlockedAt || new Date(),
      };

      // Unlock next month
      if (month < 8) {
        const nextMonthKey = `month${month + 1}`;
        monthProgress[nextMonthKey] = {
          status: 'active',
          completedAt: null,
          approvedAt: null,
          unlockedAt: new Date(),
        };
      }

      const completedMonths = client.completedMonths || [];
      if (!completedMonths.includes(month)) {
        completedMonths.push(month);
      }

      await client.update({
        monthProgress,
        completedMonths,
        currentMonth: month < 8 ? month + 1 : 8,
      });

      // Send month completion notifications (async)
      slackService.notifyMonthCompleted(client.name, month).catch((error) => {
        console.error('Error sending Slack notification:', error);
      });

      discordService.notifyMonthCompleted(client.name, month).catch((error) => {
        console.error('Error sending Discord notification:', error);
      });

      webhookService.triggerWebhook(client.id, 'month.completed', {
        clientId: client.id,
        clientName: client.name,
        monthNumber: month,
        completedAt: new Date().toISOString(),
      }).catch((error) => {
        console.error('Error triggering webhooks:', error);
      });
    }

    res.json({
      success: true,
      data: documentMeta,
      message: 'Document approved successfully',
    });
  } catch (error) {
    console.error('Error approving document:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get overall onboarding progress for a client
 * GET /api/v1/clients/:clientId/onboarding-kit/progress
 */
exports.getOnboardingProgress = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const onboardingKits = client.onboardingKits || {};
    const monthProgress = client.monthProgress || {};
    const completedMonths = client.completedMonths || [];
    const currentMonth = client.currentMonth || 1;

    // Calculate overall progress
    const totalDocuments = getTotalDocuments(); // 40
    let generatedCount = 0;
    let approvedCount = 0;

    Object.values(onboardingKits).forEach((month) => {
      if (month.documents) {
        generatedCount += month.documents.length;
        approvedCount += month.documents.filter((d) => d.status === 'approved').length;
      }
    });

    const overallProgress = Math.round((approvedCount / totalDocuments) * 100);

    res.json({
      success: true,
      data: {
        currentMonth,
        completedMonths,
        monthProgress,
        onboardingKits,
        stats: {
          totalDocuments,
          generatedCount,
          approvedCount,
          overallProgress,
        },
      },
    });
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Unlock next month
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/complete
 */
exports.completeMonth = async (req, res) => {
  try {
    const { clientId, monthNumber } = req.params;
    const month = parseInt(monthNumber);

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Verify all documents are approved
    const onboardingKits = client.onboardingKits || {};
    const monthKey = `month${month}`;
    const monthData = onboardingKits[monthKey];

    if (!monthData || !monthData.documents || monthData.documents.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Cannot complete month. Not all documents generated.',
      });
    }

    const allApproved = monthData.documents.every((d) => d.status === 'approved');
    if (!allApproved) {
      return res.status(400).json({
        success: false,
        error: 'Cannot complete month. Not all documents approved.',
      });
    }

    // Update month progress
    const monthProgress = client.monthProgress || {};
    monthProgress[monthKey] = {
      status: 'completed',
      completedAt: new Date(),
      approvedAt: new Date(),
      unlockedAt: monthProgress[monthKey]?.unlockedAt || new Date(),
    };

    // Unlock next month
    if (month < 8) {
      const nextMonthKey = `month${month + 1}`;
      monthProgress[nextMonthKey] = {
        status: 'active',
        completedAt: null,
        approvedAt: null,
        unlockedAt: new Date(),
      };
    }

    const completedMonths = client.completedMonths || [];
    if (!completedMonths.includes(month)) {
      completedMonths.push(month);
    }

    await client.update({
      monthProgress,
      completedMonths,
      currentMonth: month < 8 ? month + 1 : 8,
      journeyStage: `Month ${month < 8 ? month + 1 : 8} - ${getMonthDocuments(month < 8 ? month + 1 : 8)?.name.split(' - ')[1]}`,
    });

    // Track month completion
    analyticsService.trackEvent({
      eventType: 'month_completed',
      clientId: client.id,
      monthNumber: month,
      success: true,
    });

    // Track month unlocked (next month)
    if (month < 8) {
      analyticsService.trackEvent({
        eventType: 'month_unlocked',
        clientId: client.id,
        monthNumber: month + 1,
        success: true,
      });
    }

    res.json({
      success: true,
      message: `Month ${month} completed successfully${month < 8 ? `. Month ${month + 1} unlocked.` : ''}`,
      data: {
        completedMonth: month,
        nextMonth: month < 8 ? month + 1 : null,
        monthProgress,
      },
    });
  } catch (error) {
    console.error('Error completing month:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
