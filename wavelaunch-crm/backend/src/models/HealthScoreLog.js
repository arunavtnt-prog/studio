const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * HealthScoreLog Model
 *
 * Historical record of health score calculations for clients.
 * Enables trend analysis and understanding of score changes over time.
 *
 * Health Score Components:
 * 1. Email Activity (25%) - Frequency and recency of communications
 * 2. Milestone Progress (30%) - Completion of key milestones
 * 3. General Activity (25%) - Logins, file uploads, engagement
 * 4. Project Progress (20%) - Movement through journey stages
 *
 * Scoring Logic:
 * - Green (80-100): Healthy, on track
 * - Yellow (50-79): Needs attention
 * - Red (0-49): At risk, urgent action needed
 */
const HealthScoreLog = sequelize.define('HealthScoreLog', {
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

  // Overall Score
  healthScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  healthStatus: {
    type: DataTypes.ENUM('Green', 'Yellow', 'Red'),
    allowNull: false,
  },

  // Component Scores (0-100 each)
  emailScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  milestoneScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  activityScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  progressScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },

  // Detailed Breakdown
  factors: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Detailed factors affecting the score',
  },

  // Flags
  flags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Warning flags: ["low_email_activity", "overdue_contract", "negative_sentiment"]',
  },

  // Change Tracking
  previousScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreDelta: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Change from previous score',
  },

  // Calculation Metadata
  calculatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  calculationMethod: {
    type: DataTypes.STRING,
    defaultValue: 'v1',
    comment: 'Version of the calculation algorithm used',
  },
  dataPoints: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Raw data points used in calculation for transparency',
  },
}, {
  tableName: 'health_score_logs',
  timestamps: true,
  indexes: [
    { fields: ['clientId', 'createdAt'] },
    { fields: ['healthStatus'] },
    { fields: ['calculatedAt'] },
  ],
});

module.exports = HealthScoreLog;
