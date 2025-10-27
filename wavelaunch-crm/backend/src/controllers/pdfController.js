const pdfGenerator = require('../services/pdfGenerator');
const Client = require('../models/Client');
const path = require('path');
const fs = require('fs').promises;
const { getDocumentByNumber } = require('../utils/documentTemplates');

/**
 * PDF Controller
 *
 * Handles PDF generation for onboarding documents
 */

/**
 * Generate and download PDF for a specific document
 * GET /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/pdf
 */
exports.generateDocumentPDF = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const docNum = parseInt(docNumber);

    // Validate input
    if (month < 1 || month > 8) {
      return res.status(400).json({
        success: false,
        error: 'Month must be between 1 and 8',
      });
    }

    if (docNum < 1 || docNum > 5) {
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

    // Get document from client's onboarding kits
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: `Month ${month} documents not generated yet`,
      });
    }

    // Find the document
    const documentTemplate = getDocumentByNumber(month, docNum);
    if (!documentTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Document template not found',
      });
    }

    const document = monthData.documents.find(
      (doc) => doc.name === documentTemplate.name
    );

    if (!document || document.status === 'not-generated') {
      return res.status(404).json({
        success: false,
        error: 'Document not generated yet',
      });
    }

    // Read document content
    const documentContent = await fs.readFile(document.filePath, 'utf-8');

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generatePDF(
      documentContent,
      document.name,
      client.name,
      month,
      {
        version: document.version || 1,
        provider: document.provider,
      }
    );

    // Set response headers for PDF download
    const fileName = `${client.name.replace(/\s+/g, '-')}-Month-${month}-${document.name.replace(/\s+/g, '-')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
      details: error.message,
    });
  }
};

/**
 * Generate PDFs for all documents in a month
 * POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/generate-pdfs
 */
exports.generateMonthPDFs = async (req, res) => {
  try {
    const { clientId, monthNumber } = req.params;
    const month = parseInt(monthNumber);

    // Validate input
    if (month < 1 || month > 8) {
      return res.status(400).json({
        success: false,
        error: 'Month must be between 1 and 8',
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

    // Get month documents
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: `Month ${month} documents not generated yet`,
      });
    }

    // Create PDF directory
    const pdfDir = path.join(
      __dirname,
      '../../uploads/onboarding-kits',
      clientId,
      `month${month}`,
      'pdfs'
    );
    await fs.mkdir(pdfDir, { recursive: true });

    // Generate PDFs for all documents
    const pdfResults = [];

    for (const document of monthData.documents) {
      if (document.status === 'not-generated') continue;

      try {
        // Read document content
        const documentContent = await fs.readFile(document.filePath, 'utf-8');

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generatePDF(
          documentContent,
          document.name,
          client.name,
          month,
          {
            version: document.version || 1,
            provider: document.provider,
          }
        );

        // Save PDF to file
        const pdfFileName = `${document.name.replace(/\s+/g, '-')}-v${document.version || 1}.pdf`;
        const pdfPath = path.join(pdfDir, pdfFileName);
        await fs.writeFile(pdfPath, pdfBuffer);

        pdfResults.push({
          documentName: document.name,
          pdfPath,
          success: true,
        });
      } catch (error) {
        console.error(`Error generating PDF for ${document.name}:`, error);
        pdfResults.push({
          documentName: document.name,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        generated: pdfResults.filter((r) => r.success).length,
        failed: pdfResults.filter((r) => !r.success).length,
        results: pdfResults,
      },
    });
  } catch (error) {
    console.error('Error generating month PDFs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDFs',
      details: error.message,
    });
  }
};

/**
 * Download a specific saved PDF
 * GET /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/pdf/download
 */
exports.downloadSavedPDF = async (req, res) => {
  try {
    const { clientId, monthNumber, docNumber } = req.params;
    const month = parseInt(monthNumber);
    const docNum = parseInt(docNumber);

    // Get client
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Get document
    const monthKey = `month${month}`;
    const monthData = client.onboardingKits?.[monthKey];

    if (!monthData || !monthData.documents) {
      return res.status(404).json({
        success: false,
        error: `Month ${month} documents not found`,
      });
    }

    const documentTemplate = getDocumentByNumber(month, docNum);
    const document = monthData.documents.find(
      (doc) => doc.name === documentTemplate.name
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Check if PDF exists
    const pdfFileName = `${document.name.replace(/\s+/g, '-')}-v${document.version || 1}.pdf`;
    const pdfPath = path.join(
      __dirname,
      '../../uploads/onboarding-kits',
      clientId,
      `month${month}`,
      'pdfs',
      pdfFileName
    );

    try {
      await fs.access(pdfPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'PDF not found. Please generate it first.',
      });
    }

    // Send PDF file
    const fileName = `${client.name.replace(/\s+/g, '-')}-Month-${month}-${document.name.replace(/\s+/g, '-')}.pdf`;
    res.download(pdfPath, fileName);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download PDF',
      details: error.message,
    });
  }
};

module.exports = exports;
