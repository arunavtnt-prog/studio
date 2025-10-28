const crypto = require('crypto');

/**
 * Encryption Utility for Secure Credential Storage
 *
 * Uses AES-256-GCM for authenticated encryption of sensitive credentials.
 * Provides confidentiality, integrity, and authentication.
 *
 * Epic 1, Story 1.4: Securely store login links
 * Acceptance Criteria:
 * 1. Encrypt/mask passwords
 * 2. One-click copy for credentials
 */

// Algorithm and key derivation settings
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Get or generate encryption key from environment
 * In production, this should be stored in a secure vault (AWS KMS, GCP Secret Manager, etc.)
 */
function getEncryptionKey() {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!masterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is not set. This is required for credential encryption.');
  }

  // Derive a 256-bit key from the master key
  const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'wavelaunch-studio-salt-2024', 'utf8');
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data (passwords, API keys, tokens)
 *
 * @param {string} plaintext - The sensitive data to encrypt
 * @returns {string} - Base64 encoded encrypted data with format: iv:authTag:encryptedData
 *
 * @example
 * const encrypted = encrypt('mySecretPassword123');
 * // Returns: "a1b2c3d4....:e5f6g7h8....:i9j0k1l2...."
 */
function encrypt(plaintext) {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty value');
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData (all base64 encoded)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt credential');
  }
}

/**
 * Decrypt encrypted data
 *
 * @param {string} encryptedData - The encrypted data string (iv:authTag:encryptedData)
 * @returns {string} - The decrypted plaintext
 *
 * @example
 * const decrypted = decrypt('a1b2c3d4....:e5f6g7h8....:i9j0k1l2....');
 * // Returns: "mySecretPassword123"
 */
function decrypt(encryptedData) {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty value');
  }

  try {
    const key = getEncryptionKey();

    // Parse the encrypted data format: iv:authTag:encryptedData
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt credential - data may be corrupted or tampered with');
  }
}

/**
 * Mask a credential for display (show only first and last characters)
 *
 * @param {string} credential - The credential to mask
 * @param {number} visibleChars - Number of characters to show at start and end (default: 3)
 * @returns {string} - Masked credential
 *
 * @example
 * maskCredential('mySecretPassword123', 3)
 * // Returns: "mySe**********123"
 */
function maskCredential(credential, visibleChars = 3) {
  if (!credential || credential.length <= visibleChars * 2) {
    return '********';
  }

  const start = credential.substring(0, visibleChars);
  const end = credential.substring(credential.length - visibleChars);
  const masked = '*'.repeat(Math.max(8, credential.length - (visibleChars * 2)));

  return `${start}${masked}${end}`;
}

/**
 * Hash a value (one-way, for comparison purposes only, not retrievable)
 * Use this for audit logs or when you need to verify but not retrieve
 *
 * @param {string} value - The value to hash
 * @returns {string} - SHA-256 hash (hex encoded)
 */
function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a secure random token (useful for API keys, session tokens, etc.)
 *
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} - Hex encoded random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate encryption setup (run this on server startup)
 *
 * @returns {boolean} - True if encryption is properly configured
 */
function validateEncryptionSetup() {
  try {
    const testValue = 'test-encryption-' + Date.now();
    const encrypted = encrypt(testValue);
    const decrypted = decrypt(encrypted);

    if (testValue !== decrypted) {
      throw new Error('Encryption/decryption validation failed');
    }

    console.log('✓ Credential encryption system validated successfully');
    return true;
  } catch (error) {
    console.error('✗ Credential encryption validation failed:', error.message);
    return false;
  }
}

module.exports = {
  encrypt,
  decrypt,
  maskCredential,
  hash,
  generateSecureToken,
  validateEncryptionSetup,
};
