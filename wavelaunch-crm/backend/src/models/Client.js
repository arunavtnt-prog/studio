const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Client Model
 *
 * Represents onboarded creators with full project management capabilities.
 * Tracks progress through the creator journey and stores all related data.
 *
 * Journey Stages:
 * 1. Foundation - Initial setup and planning
 * 2. Prep - Product development and preparation
 * 3. Launch - Product launch and marketing
 * 4. Growth & Expansion - Scaling and optimization
 */
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Reference to original lead (if applicable)
  leadId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'leads',
      key: 'id',
    },
  },

  // Personal Information
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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

  // Profile Data
  profileData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Extended profile information including bio, location, timezone, etc.',
  },

  // Social Media
  socials: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'All social media handles and links',
  },

  // Brand & Assets
  brandMaterials: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Brand guidelines, colors, fonts, logos (references to file IDs)',
  },

  // Journey Progress
  journeyStage: {
    type: DataTypes.ENUM('Foundation', 'Prep', 'Launch', 'Growth & Expansion'),
    defaultValue: 'Foundation',
    allowNull: false,
  },
  journeyProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
    comment: 'Overall progress percentage (0-100)',
  },

  // Current Project Status
  currentProject: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Current project details: name, description, status, deadlines',
  },
  projectStatus: {
    type: DataTypes.ENUM('Planning', 'In Progress', 'Review', 'Completed', 'On Hold'),
    defaultValue: 'Planning',
  },

  // Health Score
  healthScore: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100,
    },
  },
  healthStatus: {
    type: DataTypes.ENUM('Green', 'Yellow', 'Red'),
    defaultValue: 'Green',
  },
  healthFactors: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Breakdown of health score components',
  },

  // Communication
  lastEmailDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailFrequency: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of emails in last 30 days',
  },
  lastTouchpoint: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  communicationSentiment: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 1,
    },
    comment: 'Average sentiment from recent communications',
  },

  // Contract & Legal
  contractStatus: {
    type: DataTypes.ENUM('Pending', 'Sent', 'Signed', 'Expired'),
    defaultValue: 'Pending',
  },
  contractSignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Financial
  revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Total revenue generated',
  },
  monthlyRecurring: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Monthly recurring revenue',
  },

  // Team Assignment
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Primary account manager user ID',
  },
  team: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of team member user IDs working with this client',
  },

  // Metadata
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Onboarding
  onboardedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  onboardingKitGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  onboardingKitSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  onboardingKitAcknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Status
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Paused', 'Churned'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'clients',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['journeyStage'] },
    { fields: ['healthStatus'] },
    { fields: ['status'] },
    { fields: ['assignedTo'] },
  ],
});

module.exports = Client;
