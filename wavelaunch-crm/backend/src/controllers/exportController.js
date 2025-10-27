const exportService = require('../services/exportService');
const { Client } = require('../models');

/**
 * Export Controller
 *
 * Handles data export in multiple formats (Excel, CSV, JSON)
 */

/**
 * Export single client data
 * GET /api/v1/clients/:clientId/export/:format
 */
exports.exportClientData = async (req, res) => {
  try {
    const { clientId, format } = req.params;

    if (!['excel', 'csv', 'json'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Supported formats: excel, csv, json',
      });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    if (format === 'excel') {
      const buffer = await exportService.exportClientData(clientId, 'excel');

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${client.name.replace(/\s+/g, '-')}-report.xlsx"`
      );
      res.send(buffer);
    } else if (format === 'csv') {
      const filePath = await exportService.exportClientData(clientId, 'csv');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${client.name.replace(/\s+/g, '-')}-data.csv"`
      );
      res.sendFile(filePath);
    } else if (format === 'json') {
      const jsonData = await exportService.exportClientData(clientId, 'json');

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${client.name.replace(/\s+/g, '-')}-data.json"`
      );
      res.send(jsonData);
    }
  } catch (error) {
    console.error('Error exporting client data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Export all clients analytics
 * GET /api/v1/analytics/export
 */
exports.exportAllClientsAnalytics = async (req, res) => {
  try {
    const { format = 'excel' } = req.query;

    if (format !== 'excel') {
      return res.status(400).json({
        success: false,
        error: 'Only Excel format is supported for all clients export',
      });
    }

    const buffer = await exportService.exportAllClientsAnalytics('excel');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="wavelaunch-analytics.xlsx"'
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting all clients analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = exports;
