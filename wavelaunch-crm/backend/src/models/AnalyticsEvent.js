const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Analytics Event Model
 *
 * Tracks all events in the onboarding system for analytics and reporting.
 * Enables detailed insights into document generation, client engagement, and team performance.
 */
const AnalyticsEvent = sequelize.define(
  'AnalyticsEvent',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Event metadata
    eventType: {
      type: DataTypes.ENUM(
        'document_generation_started',
        'document_generation_completed',
        'document_generation_failed',
        'document_viewed',
        'document_downloaded',
        'document_pdf_downloaded',
        'document_approved',
        'document_revision_requested',
        'month_unlocked',
        'month_completed',
        'business_plan_uploaded'
      ),
      allowNull: false,
      comment: 'Type of event that occurred',
    },

    eventTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the event occurred',
    },

    // Client and document references
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Client this event relates to',
    },

    monthNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 8,
      },
      comment: 'Month number (1-8) if event is month-specific',
    },

    documentNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Document number (1-5) if event is document-specific',
    },

    documentName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name of the document',
    },

    // Performance metrics
    durationMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration of the operation in milliseconds (for generation, viewing, etc.)',
    },

    tokensUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of LLM tokens used (for generation events)',
    },

    llmProvider: {
      type: DataTypes.ENUM('openai', 'claude', 'gemini'),
      allowNull: true,
      comment: 'LLM provider used (for generation events)',
    },

    // Status and results
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Whether the operation was successful',
    },

    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if operation failed',
    },

    // Additional event data
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional event-specific data (revision notes, download format, etc.)',
    },

    // User/team tracking
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User who triggered the event (for team actions)',
    },

    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Email of user who triggered the event',
    },

    // Session tracking
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Session ID for grouping related events',
    },

    // Timing relationships
    relatedEventId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of related event (e.g., generation_completed relates to generation_started)',
    },
  },
  {
    tableName: 'analytics_events',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId'],
        name: 'idx_analytics_client',
      },
      {
        fields: ['eventType'],
        name: 'idx_analytics_event_type',
      },
      {
        fields: ['eventTimestamp'],
        name: 'idx_analytics_timestamp',
      },
      {
        fields: ['monthNumber'],
        name: 'idx_analytics_month',
      },
      {
        fields: ['clientId', 'monthNumber'],
        name: 'idx_analytics_client_month',
      },
      {
        fields: ['eventType', 'eventTimestamp'],
        name: 'idx_analytics_type_timestamp',
      },
    ],
  }
);

module.exports = AnalyticsEvent;
