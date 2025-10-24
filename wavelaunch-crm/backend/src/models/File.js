const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * File Model
 *
 * Manages all uploaded files for leads and clients.
 * Supports tagging, metadata, and categorization for easy retrieval.
 *
 * File Types:
 * - Contract: Legal agreements and contracts
 * - Brand: Logos, brand guidelines, assets
 * - Deliverable: Monthly deliverables and reports
 * - OnboardingKit: Onboarding materials
 * - Other: Miscellaneous files
 */
const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Associated Entity
  entityType: {
    type: DataTypes.ENUM('Lead', 'Client'),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the associated Lead or Client',
  },

  // File Information
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes',
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Storage path or URL',
  },

  // Categorization
  category: {
    type: DataTypes.ENUM('Contract', 'Brand', 'Deliverable', 'OnboardingKit', 'Other'),
    defaultValue: 'Other',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },

  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Custom metadata: { month: "January 2024", projectName: "", description: "" }',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Access Control
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who uploaded the file',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // AI Generated
  isAiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  generationPrompt: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'The prompt used to generate this file (if AI-generated)',
  },

  // Status
  status: {
    type: DataTypes.ENUM('Active', 'Archived', 'Deleted'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'files',
  timestamps: true,
  indexes: [
    { fields: ['entityType', 'entityId'] },
    { fields: ['category'] },
    { fields: ['uploadedBy'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = File;
