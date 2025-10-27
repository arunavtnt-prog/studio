const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs').promises;
const path = require('path');
const Client = require('../models/Client');
const { getMonthDocuments } = require('../utils/documentTemplates');

/**
 * Export Service
 *
 * Handles data export in multiple formats:
 * - Excel (.xlsx) - Full reports with multiple sheets
 * - CSV (.csv) - Simple spreadsheet data
 * - JSON (.json) - Raw data export
 */
class ExportService {
  /**
   * Export client data in specified format
   */
  async exportClientData(clientId, format = 'excel') {
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    if (format === 'excel') {
      return await this.exportToExcel(client);
    } else if (format === 'csv') {
      return await this.exportToCSV(client);
    } else if (format === 'json') {
      return await this.exportToJSON(client);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export to Excel with multiple sheets
   */
  async exportToExcel(client) {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Wavelaunch Studio';
    workbook.created = new Date();

    // Sheet 1: Client Overview
    const overviewSheet = workbook.addWorksheet('Client Overview');
    overviewSheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 50 },
    ];

    // Style header row
    overviewSheet.getRow(1).font = { bold: true };
    overviewSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };
    overviewSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    overviewSheet.addRows([
      { field: 'Client Name', value: client.name },
      { field: 'Email', value: client.email },
      { field: 'Phone', value: client.phone || 'N/A' },
      { field: 'Niche', value: client.brandInfo?.niche || 'N/A' },
      { field: 'Product Type', value: client.brandInfo?.productType || 'N/A' },
      { field: 'Followers', value: client.followers || 0 },
      { field: 'Current Month', value: client.currentMonth || 1 },
      { field: 'Completed Months', value: (client.completedMonths || []).length },
      { field: 'Onboarding Start Date', value: client.createdAt?.toLocaleDateString() || 'N/A' },
      { field: 'Journey Stage', value: client.journeyStage || 'N/A' },
    ]);

    // Sheet 2: Document Status
    const docsSheet = workbook.addWorksheet('Documents');
    docsSheet.columns = [
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Document Name', key: 'name', width: 40 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Generated At', key: 'generatedAt', width: 20 },
      { header: 'Approved At', key: 'approvedAt', width: 20 },
      { header: 'Version', key: 'version', width: 10 },
      { header: 'Tokens Used', key: 'tokensUsed', width: 15 },
      { header: 'Provider', key: 'provider', width: 15 },
    ];

    // Style header row
    docsSheet.getRow(1).font = { bold: true };
    docsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };
    docsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (let month = 1; month <= 8; month++) {
      const monthKey = `month${month}`;
      const monthData = client.onboardingKits?.[monthKey];
      const monthDocs = monthData?.documents || [];

      monthDocs.forEach((doc) => {
        const row = docsSheet.addRow({
          month: month,
          name: doc.name,
          status: doc.status,
          generatedAt: doc.generatedAt ? new Date(doc.generatedAt).toLocaleDateString() : 'N/A',
          approvedAt: doc.approvedAt ? new Date(doc.approvedAt).toLocaleDateString() : 'N/A',
          version: doc.version || 1,
          tokensUsed: doc.tokensUsed || 'N/A',
          provider: doc.provider || 'N/A',
        });

        // Color code by status
        if (doc.status === 'approved') {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD4EDDA' },
          };
        } else if (doc.status === 'revision-requested') {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF3CD' },
          };
        }
      });
    }

    // Sheet 3: Analytics Summary
    const analyticsSheet = workbook.addWorksheet('Analytics');
    const analytics = await this.calculateClientAnalytics(client);

    analyticsSheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    // Style header row
    analyticsSheet.getRow(1).font = { bold: true };
    analyticsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' },
    };
    analyticsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    Object.entries(analytics).forEach(([key, value]) => {
      analyticsSheet.addRow({ metric: key, value: value });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Export to CSV
   */
  async exportToCSV(client) {
    const tmpDir = '/tmp';
    const fileName = `${client.id}-export-${Date.now()}.csv`;
    const filePath = path.join(tmpDir, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'month', title: 'Month' },
        { id: 'document', title: 'Document' },
        { id: 'status', title: 'Status' },
        { id: 'generatedAt', title: 'Generated At' },
        { id: 'approvedAt', title: 'Approved At' },
        { id: 'version', title: 'Version' },
        { id: 'tokensUsed', title: 'Tokens Used' },
      ],
    });

    const records = [];
    for (let month = 1; month <= 8; month++) {
      const monthKey = `month${month}`;
      const monthData = client.onboardingKits?.[monthKey];
      const monthDocs = monthData?.documents || [];

      monthDocs.forEach((doc) => {
        records.push({
          month: month,
          document: doc.name,
          status: doc.status,
          generatedAt: doc.generatedAt ? new Date(doc.generatedAt).toISOString() : 'N/A',
          approvedAt: doc.approvedAt ? new Date(doc.approvedAt).toISOString() : 'N/A',
          version: doc.version || 1,
          tokensUsed: doc.tokensUsed || 'N/A',
        });
      });
    }

    await csvWriter.writeRecords(records);
    return filePath;
  }

  /**
   * Export to JSON
   */
  async exportToJSON(client) {
    // Sanitize sensitive data
    const exportData = {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        niche: client.brandInfo?.niche,
        productType: client.brandInfo?.productType,
        followers: client.followers,
        currentMonth: client.currentMonth,
        completedMonths: client.completedMonths,
        journeyStage: client.journeyStage,
        createdAt: client.createdAt,
      },
      documents: {},
      analytics: await this.calculateClientAnalytics(client),
      exportedAt: new Date().toISOString(),
    };

    for (let month = 1; month <= 8; month++) {
      const monthKey = `month${month}`;
      exportData.documents[monthKey] = client.onboardingKits?.[monthKey];
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Calculate analytics for the client
   */
  async calculateClientAnalytics(client) {
    let totalGenerated = 0;
    let totalApproved = 0;
    let totalRevisions = 0;
    let totalTokens = 0;

    for (let month = 1; month <= 8; month++) {
      const monthKey = `month${month}`;
      const monthData = client.onboardingKits?.[monthKey];
      const docs = monthData?.documents || [];

      totalGenerated += docs.length;
      totalApproved += docs.filter((d) => d.status === 'approved').length;
      totalRevisions += docs.filter((d) => d.revisionRequested).length;
      totalTokens += docs.reduce((sum, d) => sum + (d.tokensUsed || 0), 0);
    }

    const daysInProgram = Math.floor((new Date() - new Date(client.createdAt)) / (1000 * 60 * 60 * 24));
    const completedMonthsCount = (client.completedMonths || []).length;

    return {
      'Total Documents Generated': totalGenerated,
      'Total Documents Approved': totalApproved,
      'Total Revisions Requested': totalRevisions,
      'Approval Rate': totalGenerated > 0 ? `${((totalApproved / totalGenerated) * 100).toFixed(1)}%` : '0%',
      'Revision Rate': totalGenerated > 0 ? `${((totalRevisions / totalGenerated) * 100).toFixed(1)}%` : '0%',
      'Total Tokens Used': totalTokens.toLocaleString(),
      'Days in Program': daysInProgram,
      'Completed Months': completedMonthsCount,
      'Average Days per Month':
        completedMonthsCount > 0 ? (daysInProgram / completedMonthsCount).toFixed(1) : 'N/A',
      'Program Progress': `${((completedMonthsCount / 8) * 100).toFixed(1)}%`,
      'Current Month': client.currentMonth || 1,
    };
  }

  /**
   * Export all clients' analytics
   */
  async exportAllClientsAnalytics(format = 'excel') {
    const clients = await Client.findAll();

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('All Clients Analytics');

      sheet.columns = [
        { header: 'Client Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Current Month', key: 'month', width: 15 },
        { header: 'Completed Months', key: 'completed', width: 15 },
        { header: 'Progress %', key: 'progress', width: 15 },
        { header: 'Days in Program', key: 'days', width: 15 },
        { header: 'Documents Generated', key: 'generated', width: 20 },
        { header: 'Documents Approved', key: 'approved', width: 20 },
      ];

      // Style header
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' },
      };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      for (const client of clients) {
        const analytics = await this.calculateClientAnalytics(client);
        const daysInProgram = Math.floor(
          (new Date() - new Date(client.createdAt)) / (1000 * 60 * 60 * 24)
        );

        sheet.addRow({
          name: client.name,
          email: client.email,
          month: client.currentMonth || 1,
          completed: (client.completedMonths || []).length,
          progress: `${(((client.completedMonths || []).length / 8) * 100).toFixed(1)}%`,
          days: daysInProgram,
          generated: analytics['Total Documents Generated'],
          approved: analytics['Total Documents Approved'],
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    }

    throw new Error('Only Excel format is supported for all clients export');
  }
}

module.exports = new ExportService();
