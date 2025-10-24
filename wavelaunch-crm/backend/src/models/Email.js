const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Email Model
 *
 * Stores synced emails from Gmail API for each client.
 * Enables tracking of communication history, frequency, and sentiment.
 *
 * Sync Process:
 * 1. Gmail API fetches new messages
 * 2. Parser extracts relevant information
 * 3. Sentiment analysis runs on content
 * 4. Email attached to client profile
 * 5. Health score updated based on activity
 */
const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Associated Client
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  // Gmail API Data
  gmailMessageId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique message ID from Gmail',
  },
  threadId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Gmail thread ID for grouping conversations',
  },

  // Email Headers
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  cc: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  // Content
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  snippet: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Short preview of the email (from Gmail)',
  },
  isHtml: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Analysis
  sentiment: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 1,
    },
    comment: 'Sentiment score (0=negative, 0.5=neutral, 1=positive)',
  },
  sentimentLabel: {
    type: DataTypes.ENUM('Positive', 'Neutral', 'Negative'),
    allowNull: true,
  },
  keyTopics: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'AI-extracted key topics from the email',
  },
  urgency: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },

  // Classification
  direction: {
    type: DataTypes.ENUM('Incoming', 'Outgoing'),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('General', 'Support', 'Milestone', 'Contract', 'Financial', 'Other'),
    defaultValue: 'General',
  },

  // Tracking
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasAttachments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of attachment metadata',
  },

  // Flags
  isImportant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  requiresAction: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  actionTaken: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Sync Status
  syncedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'emails',
  timestamps: true,
  indexes: [
    { fields: ['clientId'] },
    { fields: ['gmailMessageId'] },
    { fields: ['threadId'] },
    { fields: ['date'] },
    { fields: ['direction'] },
    { fields: ['sentiment'] },
  ],
});

module.exports = Email;
