const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Lead Model
 *
 * Represents creator applications before they are onboarded.
 * Tracks initial contact information, social metrics, and application status.
 *
 * Workflow:
 * 1. New application creates Lead record
 * 2. AI analyzes and scores the application
 * 3. Lead progresses through stages
 * 4. When "Onboarded", converted to Client
 */
const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Personal Information
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Social Media Information
  socials: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Structure: { instagram: "", youtube: "", tiktok: "", twitter: "", website: "" }',
  },

  // Creator Metrics
  niche: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  followers: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Structure: { instagram: 0, youtube: 0, tiktok: 0, total: 0 }',
  },
  engagement: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Structure: { rate: 0, avgLikes: 0, avgComments: 0 }',
  },

  // Application Data
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Creator-provided summary or bio',
  },
  customFormAnswers: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Answers to custom application questions',
  },

  // AI Analysis Results
  aiSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI-generated summary of the application',
  },
  sentimentScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 1,
    },
    comment: 'Sentiment analysis score (0-1)',
  },
  fitScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
    comment: 'AI-calculated fit score (0-100)',
  },
  aiAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Full AI analysis results including strengths, concerns, recommendations',
  },

  // Lead Status
  stage: {
    type: DataTypes.ENUM('Warm', 'Interested', 'Almost Onboarded', 'Onboarded', 'Rejected'),
    defaultValue: 'Warm',
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
    defaultValue: 'Medium',
  },

  // Tracking
  source: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Where the lead came from (e.g., website, referral, Instagram)',
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID of assigned team member',
  },
  lastContactedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Timestamps
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  onboardedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'leads',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['stage'] },
    { fields: ['fitScore'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Lead;
