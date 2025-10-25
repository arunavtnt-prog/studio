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

  // Journey Progress (Updated for 8-Month Program)
  journeyStage: {
    type: DataTypes.ENUM(
      'Month 1 - Foundation Excellence',
      'Month 2 - Brand Readiness & Productization',
      'Month 3 - Market Entry Preparation',
      'Month 4 - Sales Engine & Launch Infrastructure',
      'Month 5 - Pre-Launch Mastery',
      'Month 6 - Soft Launch Execution',
      'Month 7 - Scaling & Growth Systems',
      'Month 8 - Full Launch & Market Domination',
      // Legacy stages (for backward compatibility)
      'Foundation',
      'Prep',
      'Launch',
      'Growth & Expansion'
    ),
    defaultValue: 'Month 1 - Foundation Excellence',
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

  // Onboarding (Legacy - keep for backward compatibility)
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

  // 8-Month Onboarding Program
  currentMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 8,
    },
    comment: 'Current month in the 8-month onboarding program',
  },
  completedMonths: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    comment: 'Array of completed month numbers [1, 2, 3, ...]',
  },
  monthProgress: {
    type: DataTypes.JSONB,
    defaultValue: {
      month1: { status: 'active', completedAt: null, approvedAt: null, unlockedAt: null },
      month2: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
      month3: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
      month4: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
      month5: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
      month6: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
      month7: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
      month8: { status: 'locked', completedAt: null, approvedAt: null, unlockedAt: null },
    },
    comment: 'Status tracking for each month (active, locked, completed)',
  },

  // Brand & Product Information
  brandInfo: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      niche: 'String - e.g., Fitness & Wellness, Beauty, Tech',
      productType: 'String - e.g., Physical Product, Digital Course, Subscription Box',
      skus: ['Array of SKUs'],
      pricePoints: { low: 0, mid: 0, high: 0 },
      valueProposition: 'String - What makes them unique',
      targetAudience: {
        demographics: 'String',
        psychographics: 'String',
        painPoints: ['Array of pain points'],
      },
    }),
  },

  // Market Position
  marketPosition: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      competitors: [{ name: 'String', strength: 'String' }],
      differentiators: ['Array of differentiators'],
      marketSize: 'String',
    }),
  },

  // Content & Community
  contentAssets: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      platforms: ['Instagram', 'YouTube', 'TikTok'],
      contentLibrarySize: 0,
      postingFrequency: { instagram: 'daily', youtube: 'weekly' },
      topPerformingContent: ['Array of URLs or descriptions'],
    }),
  },
  communityMetrics: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      emailListSize: 0,
      engagementRate: 0,
      affiliateCount: 0,
      communityPlatform: 'Discord, Circle, etc.',
    }),
  },

  // Revenue & Goals
  revenueGoals: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      softLaunchTarget: 0,
      fullLaunchTarget: 0,
      year1Revenue: 0,
      ltvGoal: 0,
      profitMarginTarget: 0,
    }),
  },
  launchTimeline: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      onboardingStartDate: null,
      softLaunchDate: null,
      fullLaunchDate: null,
    }),
  },

  // Tech Stack
  techStack: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      ecommercePlatform: 'Shopify, WooCommerce, etc.',
      emailProvider: 'Klaviyo, ConvertKit, etc.',
      crmPlatform: 'String',
      analyticsTools: ['Array of tools'],
      adPlatforms: ['Array of platforms'],
    }),
  },

  // Team Structure
  teamStructure: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      inHouseTeam: [{ role: 'String', name: 'String' }],
      contractors: [{ role: 'String', name: 'String' }],
      agencyPartners: [{ role: 'String', company: 'String' }],
    }),
  },

  // Business Plan
  businessPlan: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: JSON.stringify({
      uploaded: false,
      uploadedAt: null,
      filePath: null,
      parsedData: {},
      lastUpdated: null,
    }),
  },

  // Onboarding Kit Documents (40 documents total, 5 per month)
  onboardingKits: {
    type: DataTypes.JSONB,
    defaultValue: {
      month1: { generated: false, generatedAt: null, documents: [] },
      month2: { generated: false, generatedAt: null, documents: [] },
      month3: { generated: false, generatedAt: null, documents: [] },
      month4: { generated: false, generatedAt: null, documents: [] },
      month5: { generated: false, generatedAt: null, documents: [] },
      month6: { generated: false, generatedAt: null, documents: [] },
      month7: { generated: false, generatedAt: null, documents: [] },
      month8: { generated: false, generatedAt: null, documents: [] },
    },
    comment: 'Stores all generated documents and their status for all 8 months',
  },

  // Launch Tracking (Pre-Launch CRM Focus)
  expectedLaunchDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Target launch date for the brand',
  },
  actualLaunchDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Actual launch date (when it happens)',
  },
  launchReadinessScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
    comment: 'How ready they are to launch (0-100)',
  },
  launchBlockers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'What is blocking them from launching',
  },
  checklistProgress: {
    type: DataTypes.JSONB,
    defaultValue: {
      Foundation: { completed: 0, total: 0 },
      Prep: { completed: 0, total: 0 },
      Launch: { completed: 0, total: 0 },
    },
    comment: 'Checklist completion per stage',
  },
  daysInCurrentStage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of days in current journey stage',
  },
  isStuck: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the client is stuck/stalled',
  },
  stuckReason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Why they are stuck (if applicable)',
  },
  lastActivityDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last meaningful activity (file upload, email, milestone)',
  },

  // Status
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Paused', 'Churned', 'Launched'),
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
    { fields: ['expectedLaunchDate'] },
    { fields: ['launchReadinessScore'] },
    { fields: ['isStuck'] },
    { fields: ['lastActivityDate'] },
  ],
});

module.exports = Client;
