const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Milestone Model
 *
 * Defines key outcomes and achievements for client journeys.
 * Tracks completion and triggers automations when milestones are reached.
 *
 * Example Milestones:
 * - Onboarding Complete
 * - Brand Materials Submitted
 * - Product Launched
 * - First $10K Revenue
 * - First 100 Customers
 * - Course Completed
 *
 * Triggers:
 * - Email notifications
 * - Health score updates
 * - Next milestone creation
 * - Document generation
 */
const Milestone = sequelize.define('Milestone', {
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

  // Milestone Details
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('Onboarding', 'Product', 'Launch', 'Revenue', 'Growth', 'Content', 'Custom'),
    allowNull: false,
  },

  // Progress
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Skipped'),
    defaultValue: 'Pending',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },

  // Dates
  targetDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Checklist (optional sub-tasks)
  checklist: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of { task: "", completed: false, completedAt: null }',
  },

  // Impact
  impactOnHealth: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: -50,
      max: 50,
    },
    comment: 'Impact on health score when completed (can be positive or negative)',
  },

  // Automation
  triggerActions: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Actions to trigger on completion: ["send_email", "generate_document", "create_milestone"]',
  },
  automationData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Data needed for triggered automations',
  },
  triggered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Priority & Dependencies
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order in milestone list',
  },
  dependsOn: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Milestone IDs that must be completed first',
  },

  // Assignment
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Team member responsible for this milestone',
  },

  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'milestones',
  timestamps: true,
  indexes: [
    { fields: ['clientId'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['targetDate'] },
  ],
});

module.exports = Milestone;
