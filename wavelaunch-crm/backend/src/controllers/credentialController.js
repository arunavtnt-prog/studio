const { Credential, Client, ActivityLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Credential Controller
 *
 * Epic 1, Story 1.4: Securely store login links
 *
 * Manages secure credential storage and retrieval for client operational platforms.
 * All sensitive data is encrypted at rest using AES-256-GCM.
 *
 * Acceptance Criteria:
 * 1. Encrypt/mask passwords - All credentials encrypted, masked for display
 * 2. One-click copy for credentials - API provides decrypted values when needed
 *
 * Security Features:
 * - All credential access is logged
 * - Credentials are only decrypted on explicit reveal requests
 * - Default responses include masked versions only
 */

const credentialController = {
  /**
   * Create New Credential
   * POST /api/v1/credentials
   * POST /api/v1/clients/:clientId/credentials
   */
  async createCredential(req, res) {
    try {
      const { clientId: paramClientId } = req.params;
      const {
        clientId: bodyClientId,
        platform,
        platformCategory,
        accountIdentifier,
        username,
        password,
        apiKey,
        secret,
        notes,
        loginUrl,
        credentialType,
        status,
        expiresAt,
        tags,
        priority,
      } = req.body;

      // Use clientId from params or body
      const clientId = paramClientId || bodyClientId;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: 'clientId is required',
        });
      }

      if (!password && !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Either password or apiKey is required',
        });
      }

      // Verify client exists
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found',
        });
      }

      // Create credential
      const credential = await Credential.create({
        clientId,
        platform,
        platformCategory: platformCategory || 'Other',
        accountIdentifier,
        loginUrl,
        credentialType: credentialType || 'Password',
        status: status || 'Active',
        expiresAt,
        tags: tags || [],
        priority: priority || 'Medium',
        createdBy: req.user?.id || null, // Will be populated when auth is implemented
      });

      // Set encrypted fields using helper methods
      if (username) credential.setUsername(username);
      if (password) credential.setPassword(password);
      if (apiKey) credential.setApiKey(apiKey);
      if (secret) credential.setSecret(secret);
      if (notes) credential.setNotes(notes);

      await credential.save();

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: clientId,
        activityType: 'credential_created',
        title: `New credential added: ${platform}`,
        description: `${credentialType || 'Password'} credential for ${accountIdentifier || platform}`,
        metadata: {
          credentialId: credential.id,
          platform,
          platformCategory,
        },
        isAutomated: false,
        icon: 'key',
        importance: 'Medium',
      });

      res.status(201).json({
        success: true,
        message: 'Credential created successfully',
        data: credential.toSafeObject(),
      });
    } catch (error) {
      console.error('Error creating credential:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get All Credentials for a Client
   * GET /api/v1/clients/:clientId/credentials
   */
  async getClientCredentials(req, res) {
    try {
      const { clientId } = req.params;
      const { platformCategory, status, priority } = req.query;

      const whereClause = { clientId };

      if (platformCategory) {
        whereClause.platformCategory = platformCategory;
      }
      if (status) {
        whereClause.status = status;
      }
      if (priority) {
        whereClause.priority = priority;
      }

      const credentials = await Credential.findAll({
        where: whereClause,
        order: [
          ['priority', 'DESC'],
          ['platform', 'ASC'],
        ],
      });

      res.json({
        success: true,
        count: credentials.length,
        data: credentials.map(c => c.toSafeObject()),
      });
    } catch (error) {
      console.error('Error fetching credentials:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Single Credential (Masked)
   * GET /api/v1/credentials/:id
   */
  async getCredential(req, res) {
    try {
      const { id } = req.params;

      const credential = await Credential.findByPk(id, {
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found',
        });
      }

      res.json({
        success: true,
        data: {
          ...credential.toSafeObject(),
          client: credential.client,
        },
      });
    } catch (error) {
      console.error('Error fetching credential:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Reveal Credential (Decrypt Sensitive Fields)
   * POST /api/v1/credentials/:id/reveal
   *
   * This endpoint provides decrypted credentials for one-click copy functionality.
   * Access is logged for audit purposes.
   */
  async revealCredential(req, res) {
    try {
      const { id } = req.params;
      const { field } = req.body; // Optional: 'password', 'username', 'apiKey', 'secret', 'notes'

      const credential = await Credential.findByPk(id);

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found',
        });
      }

      // Record access for audit trail
      await credential.recordAccess(req.user?.id || null);

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: credential.clientId,
        activityType: 'credential_accessed',
        title: `Credential accessed: ${credential.platform}`,
        description: `${field || 'Full credential'} revealed for ${credential.accountIdentifier || credential.platform}`,
        metadata: {
          credentialId: credential.id,
          platform: credential.platform,
          field: field || 'all',
          accessedBy: req.user?.id || 'system',
        },
        isAutomated: false,
        icon: 'eye',
        importance: 'Medium',
      });

      // Build response with decrypted values
      const revealedData = {
        id: credential.id,
        platform: credential.platform,
        accountIdentifier: credential.accountIdentifier,
        loginUrl: credential.loginUrl,
      };

      if (!field || field === 'username') {
        revealedData.username = credential.getUsername();
      }
      if (!field || field === 'password') {
        revealedData.password = credential.getPassword();
      }
      if (!field || field === 'apiKey') {
        revealedData.apiKey = credential.getApiKey();
      }
      if (!field || field === 'secret') {
        revealedData.secret = credential.getSecret();
      }
      if (!field || field === 'notes') {
        revealedData.notes = credential.getNotes();
      }

      res.json({
        success: true,
        message: 'Credential revealed - access logged',
        data: revealedData,
        accessCount: credential.accessCount,
        lastAccessedAt: credential.lastAccessedAt,
      });
    } catch (error) {
      console.error('Error revealing credential:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Update Credential
   * PATCH /api/v1/credentials/:id
   */
  async updateCredential(req, res) {
    try {
      const { id } = req.params;
      const {
        platform,
        platformCategory,
        accountIdentifier,
        username,
        password,
        apiKey,
        secret,
        notes,
        loginUrl,
        credentialType,
        status,
        expiresAt,
        lastVerifiedAt,
        tags,
        priority,
      } = req.body;

      const credential = await Credential.findByPk(id);

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found',
        });
      }

      // Update non-encrypted fields
      if (platform !== undefined) credential.platform = platform;
      if (platformCategory !== undefined) credential.platformCategory = platformCategory;
      if (accountIdentifier !== undefined) credential.accountIdentifier = accountIdentifier;
      if (loginUrl !== undefined) credential.loginUrl = loginUrl;
      if (credentialType !== undefined) credential.credentialType = credentialType;
      if (status !== undefined) credential.status = status;
      if (expiresAt !== undefined) credential.expiresAt = expiresAt;
      if (lastVerifiedAt !== undefined) credential.lastVerifiedAt = lastVerifiedAt;
      if (tags !== undefined) credential.tags = tags;
      if (priority !== undefined) credential.priority = priority;

      // Update encrypted fields if provided
      if (username !== undefined) credential.setUsername(username);
      if (password !== undefined) credential.setPassword(password);
      if (apiKey !== undefined) credential.setApiKey(apiKey);
      if (secret !== undefined) credential.setSecret(secret);
      if (notes !== undefined) credential.setNotes(notes);

      credential.updatedBy = req.user?.id || null;
      await credential.save();

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: credential.clientId,
        activityType: 'credential_updated',
        title: `Credential updated: ${credential.platform}`,
        description: `Updated credential for ${credential.accountIdentifier || credential.platform}`,
        metadata: {
          credentialId: credential.id,
          platform: credential.platform,
          updatedFields: Object.keys(req.body),
        },
        isAutomated: false,
        icon: 'pencil',
        importance: 'Medium',
      });

      res.json({
        success: true,
        message: 'Credential updated successfully',
        data: credential.toSafeObject(),
      });
    } catch (error) {
      console.error('Error updating credential:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Delete Credential
   * DELETE /api/v1/credentials/:id
   */
  async deleteCredential(req, res) {
    try {
      const { id } = req.params;

      const credential = await Credential.findByPk(id);

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found',
        });
      }

      const clientId = credential.clientId;
      const platform = credential.platform;

      // Log activity before deletion
      await ActivityLog.create({
        entityType: 'Client',
        entityId: clientId,
        activityType: 'credential_deleted',
        title: `Credential deleted: ${platform}`,
        description: `Removed credential for ${credential.accountIdentifier || platform}`,
        metadata: {
          credentialId: id,
          platform,
          deletedBy: req.user?.id || 'system',
        },
        isAutomated: false,
        icon: 'trash',
        importance: 'High',
      });

      await credential.destroy();

      res.json({
        success: true,
        message: 'Credential deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting credential:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get Credentials Needing Attention
   * GET /api/v1/credentials/attention
   *
   * Returns credentials that are expired or need updates
   */
  async getCredentialsNeedingAttention(req, res) {
    try {
      const credentials = await Credential.findAll({
        where: {
          [Op.or]: [
            { status: 'Expired' },
            { status: 'Needs Update' },
            {
              expiresAt: {
                [Op.lt]: new Date(),
              },
            },
          ],
        },
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['priority', 'DESC'], ['expiresAt', 'ASC']],
      });

      res.json({
        success: true,
        count: credentials.length,
        data: credentials.map(c => ({
          ...c.toSafeObject(),
          client: c.client,
          isExpired: c.isExpired(),
        })),
      });
    } catch (error) {
      console.error('Error fetching credentials needing attention:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Verify Credential (Mark as verified)
   * POST /api/v1/credentials/:id/verify
   */
  async verifyCredential(req, res) {
    try {
      const { id } = req.params;
      const { verified, notes } = req.body;

      const credential = await Credential.findByPk(id);

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: 'Credential not found',
        });
      }

      credential.lastVerifiedAt = new Date();
      if (verified === true) {
        credential.status = 'Active';
      } else if (verified === false) {
        credential.status = 'Needs Update';
      }

      await credential.save();

      // Log activity
      await ActivityLog.create({
        entityType: 'Client',
        entityId: credential.clientId,
        activityType: 'credential_verified',
        title: `Credential ${verified ? 'verified' : 'verification failed'}: ${credential.platform}`,
        description: notes || `Credential verification ${verified ? 'successful' : 'failed'}`,
        metadata: {
          credentialId: credential.id,
          platform: credential.platform,
          verified,
        },
        isAutomated: false,
        icon: verified ? 'check-circle' : 'exclamation-circle',
        importance: 'Medium',
      });

      res.json({
        success: true,
        message: `Credential marked as ${verified ? 'verified' : 'needs update'}`,
        data: credential.toSafeObject(),
      });
    } catch (error) {
      console.error('Error verifying credential:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = credentialController;
