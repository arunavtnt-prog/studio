/**
 * Models Index
 *
 * Central export point for all database models.
 * Defines relationships between models.
 */

const Lead = require('./Lead');
const Client = require('./Client');
const File = require('./File');
const Email = require('./Email');
const Milestone = require('./Milestone');
const HealthScoreLog = require('./HealthScoreLog');
const ActivityLog = require('./ActivityLog');
const AnalyticsEvent = require('./AnalyticsEvent');
const Credential = require('./Credential');

/**
 * Define Model Relationships
 */

// Client <-> Lead (One-to-One)
Client.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });
Lead.hasOne(Client, { foreignKey: 'leadId', as: 'client' });

// Client <-> Files (One-to-Many)
Client.hasMany(File, {
  foreignKey: 'entityId',
  constraints: false,
  scope: { entityType: 'Client' },
  as: 'files',
});

// Lead <-> Files (One-to-Many)
Lead.hasMany(File, {
  foreignKey: 'entityId',
  constraints: false,
  scope: { entityType: 'Lead' },
  as: 'files',
});

// Client <-> Emails (One-to-Many)
Client.hasMany(Email, { foreignKey: 'clientId', as: 'emails' });
Email.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Client <-> Milestones (One-to-Many)
Client.hasMany(Milestone, { foreignKey: 'clientId', as: 'milestones' });
Milestone.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Client <-> HealthScoreLogs (One-to-Many)
Client.hasMany(HealthScoreLog, { foreignKey: 'clientId', as: 'healthScoreLogs' });
HealthScoreLog.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Client <-> ActivityLogs (One-to-Many)
Client.hasMany(ActivityLog, {
  foreignKey: 'entityId',
  constraints: false,
  scope: { entityType: 'Client' },
  as: 'activityLogs',
});

// Lead <-> ActivityLogs (One-to-Many)
Lead.hasMany(ActivityLog, {
  foreignKey: 'entityId',
  constraints: false,
  scope: { entityType: 'Lead' },
  as: 'activityLogs',
});

// Client <-> AnalyticsEvents (One-to-Many)
Client.hasMany(AnalyticsEvent, { foreignKey: 'clientId', as: 'analyticsEvents' });
AnalyticsEvent.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Client <-> Credentials (One-to-Many)
// Epic 1, Story 1.4: Securely store login links
Client.hasMany(Credential, { foreignKey: 'clientId', as: 'credentials' });
Credential.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

module.exports = {
  Lead,
  Client,
  File,
  Email,
  Milestone,
  HealthScoreLog,
  ActivityLog,
  AnalyticsEvent,
  Credential,
};
