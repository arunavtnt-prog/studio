const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ActivityLog Model
 *
 * Comprehensive activity tracking for clients.
 * Records all significant events and interactions for timeline display.
 *
 * Activity Types:
 * - email_received, email_sent
 * - file_uploaded, file_downloaded
 * - milestone_completed
 * - project_status_changed
 * - contract_signed
 * - note_added
 * - stage_changed
 * - onboarding_kit_generated
 * - health_score_changed
 */
const ActivityLog = sequelize.define('ActivityLog', {
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
  },

  // Activity Details
  activityType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of activity (email_sent, file_uploaded, etc.)',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Related Records
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type of related entity (Email, File, Milestone)',
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of related entity',
  },

  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional data specific to the activity type',
  },

  // User Tracking
  performedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who performed the action (null for automated)',
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Display
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Icon identifier for UI display',
  },
  importance: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
  indexes: [
    { fields: ['entityType', 'entityId'] },
    { fields: ['activityType'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = ActivityLog;
