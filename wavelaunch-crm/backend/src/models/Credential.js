const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { encrypt, decrypt, maskCredential } = require('../utils/encryption');

/**
 * Credential Model
 *
 * Epic 1, Story 1.4: Securely store login links
 *
 * Stores encrypted credentials for creator/brand operational platforms:
 * - Social media accounts (Instagram, TikTok, YouTube, etc.)
 * - E-commerce platforms (Shopify, WooCommerce, etc.)
 * - Marketing tools (Klaviyo, ConvertKit, etc.)
 * - Analytics platforms (Google Analytics, etc.)
 * - Any other platform requiring secure access
 *
 * Acceptance Criteria:
 * 1. Encrypt/mask passwords - Credentials are encrypted at rest using AES-256-GCM
 * 2. One-click copy for credentials - API provides both masked and decrypted versions
 *
 * Security Features:
 * - All sensitive data encrypted before storage
 * - Audit trail for credential access
 * - Automatic masking for display
 * - Support for multiple credential types per client
 */
const Credential = sequelize.define('Credential', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Client relationship
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },

  // Credential identification
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Platform name (e.g., Instagram, Shopify, Klaviyo, YouTube)',
  },

  platformCategory: {
    type: DataTypes.ENUM(
      'Social Media',
      'E-commerce',
      'Email Marketing',
      'Analytics',
      'Advertising',
      'Content Management',
      'Other'
    ),
    defaultValue: 'Other',
    comment: 'Category for organization and filtering',
  },

  accountIdentifier: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Username, email, or account ID (not sensitive, stored in plaintext)',
  },

  // Encrypted credentials
  encryptedUsername: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted username/login (if different from accountIdentifier)',
  },

  encryptedPassword: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Encrypted password (AES-256-GCM)',
  },

  encryptedApiKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted API key (for platforms using API access)',
  },

  encryptedSecret: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted API secret or other sensitive tokens',
  },

  encryptedNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted additional notes (2FA codes, security questions, etc.)',
  },

  // URLs and access info (not sensitive)
  loginUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Direct login URL for the platform',
  },

  // Metadata
  credentialType: {
    type: DataTypes.ENUM('Password', 'API Key', 'OAuth Token', 'SSH Key', 'Other'),
    defaultValue: 'Password',
  },

  status: {
    type: DataTypes.ENUM('Active', 'Expired', 'Revoked', 'Needs Update'),
    defaultValue: 'Active',
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this credential expires (if applicable)',
  },

  lastVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time this credential was verified to work',
  },

  // Access tracking
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time this credential was accessed/revealed',
  },

  lastAccessedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who last accessed this credential',
  },

  accessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times this credential has been accessed',
  },

  // Additional metadata
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for organization (e.g., "primary", "backup", "admin")',
  },

  priority: {
    type: DataTypes.ENUM('Critical', 'High', 'Medium', 'Low'),
    defaultValue: 'Medium',
    comment: 'Importance level for this credential',
  },

  // Audit fields
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who created this credential',
  },

  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who last updated this credential',
  },
}, {
  tableName: 'credentials',
  timestamps: true,
  indexes: [
    { fields: ['clientId'] },
    { fields: ['platform'] },
    { fields: ['platformCategory'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['expiresAt'] },
  ],
});

/**
 * Instance Methods
 */

/**
 * Set encrypted password
 * @param {string} plainPassword - Plain text password to encrypt
 */
Credential.prototype.setPassword = function(plainPassword) {
  this.encryptedPassword = encrypt(plainPassword);
};

/**
 * Get decrypted password
 * @returns {string} - Decrypted password
 */
Credential.prototype.getPassword = function() {
  if (!this.encryptedPassword) return null;
  return decrypt(this.encryptedPassword);
};

/**
 * Set encrypted username
 * @param {string} plainUsername - Plain text username to encrypt
 */
Credential.prototype.setUsername = function(plainUsername) {
  this.encryptedUsername = encrypt(plainUsername);
};

/**
 * Get decrypted username
 * @returns {string} - Decrypted username
 */
Credential.prototype.getUsername = function() {
  if (!this.encryptedUsername) return null;
  return decrypt(this.encryptedUsername);
};

/**
 * Set encrypted API key
 * @param {string} plainApiKey - Plain text API key to encrypt
 */
Credential.prototype.setApiKey = function(plainApiKey) {
  this.encryptedApiKey = encrypt(plainApiKey);
};

/**
 * Get decrypted API key
 * @returns {string} - Decrypted API key
 */
Credential.prototype.getApiKey = function() {
  if (!this.encryptedApiKey) return null;
  return decrypt(this.encryptedApiKey);
};

/**
 * Set encrypted secret
 * @param {string} plainSecret - Plain text secret to encrypt
 */
Credential.prototype.setSecret = function(plainSecret) {
  this.encryptedSecret = encrypt(plainSecret);
};

/**
 * Get decrypted secret
 * @returns {string} - Decrypted secret
 */
Credential.prototype.getSecret = function() {
  if (!this.encryptedSecret) return null;
  return decrypt(this.encryptedSecret);
};

/**
 * Set encrypted notes
 * @param {string} plainNotes - Plain text notes to encrypt
 */
Credential.prototype.setNotes = function(plainNotes) {
  this.encryptedNotes = encrypt(plainNotes);
};

/**
 * Get decrypted notes
 * @returns {string} - Decrypted notes
 */
Credential.prototype.getNotes = function() {
  if (!this.encryptedNotes) return null;
  return decrypt(this.encryptedNotes);
};

/**
 * Get a safe representation of the credential (with masked sensitive data)
 * Used for displaying credentials in the UI
 *
 * @returns {Object} - Safe credential object with masked sensitive fields
 */
Credential.prototype.toSafeObject = function() {
  const safeObj = {
    id: this.id,
    clientId: this.clientId,
    platform: this.platform,
    platformCategory: this.platformCategory,
    accountIdentifier: this.accountIdentifier,
    loginUrl: this.loginUrl,
    credentialType: this.credentialType,
    status: this.status,
    expiresAt: this.expiresAt,
    lastVerifiedAt: this.lastVerifiedAt,
    lastAccessedAt: this.lastAccessedAt,
    tags: this.tags,
    priority: this.priority,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Add masked versions of sensitive fields
  if (this.encryptedUsername) {
    safeObj.maskedUsername = maskCredential(this.getUsername());
  }
  if (this.encryptedPassword) {
    safeObj.maskedPassword = maskCredential(this.getPassword());
  }
  if (this.encryptedApiKey) {
    safeObj.maskedApiKey = maskCredential(this.getApiKey());
  }
  if (this.encryptedSecret) {
    safeObj.maskedSecret = maskCredential(this.getSecret());
  }
  if (this.encryptedNotes) {
    safeObj.hasNotes = true; // Don't reveal notes content in list view
  }

  return safeObj;
};

/**
 * Record an access event (for audit trail)
 * @param {string} userId - ID of the user accessing the credential
 */
Credential.prototype.recordAccess = async function(userId) {
  this.lastAccessedAt = new Date();
  this.lastAccessedBy = userId;
  this.accessCount += 1;
  await this.save();
};

/**
 * Check if credential is expired
 * @returns {boolean}
 */
Credential.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

/**
 * Check if credential needs attention (expired or needs update)
 * @returns {boolean}
 */
Credential.prototype.needsAttention = function() {
  return this.status === 'Expired' ||
         this.status === 'Needs Update' ||
         this.isExpired();
};

module.exports = Credential;
