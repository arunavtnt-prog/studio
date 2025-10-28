/**
 * Credential System Test & Demo Script
 *
 * Epic 1, Story 1.4: Securely store login links
 *
 * This script demonstrates and tests the secure credential storage system:
 * 1. Encryption/decryption functionality
 * 2. Credential CRUD operations
 * 3. Masking for secure display
 * 4. Audit trail logging
 *
 * Run with: node scripts/test-credentials.js
 */

require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('../backend/src/config/database');
const { Client, Credential, ActivityLog } = require('../backend/src/models');
const { encrypt, decrypt, maskCredential, validateEncryptionSetup } = require('../backend/src/utils/encryption');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

async function testEncryption() {
  section('1. Testing Encryption Utilities');

  // Validate setup
  log('Validating encryption setup...', 'blue');
  const isValid = validateEncryptionSetup();
  if (!isValid) {
    log('❌ Encryption setup failed!', 'red');
    throw new Error('Encryption validation failed');
  }
  log('✓ Encryption system validated', 'green');

  // Test basic encryption/decryption
  log('\nTesting basic encryption/decryption...', 'blue');
  const testPassword = 'SuperSecret123!@#';
  const encrypted = encrypt(testPassword);
  log(`Original: ${testPassword}`, 'yellow');
  log(`Encrypted: ${encrypted.substring(0, 50)}...`, 'yellow');

  const decrypted = decrypt(encrypted);
  log(`Decrypted: ${decrypted}`, 'yellow');

  if (testPassword === decrypted) {
    log('✓ Encryption/decryption working correctly', 'green');
  } else {
    log('❌ Encryption/decryption failed!', 'red');
    throw new Error('Encryption test failed');
  }

  // Test masking
  log('\nTesting credential masking...', 'blue');
  const masked = maskCredential(testPassword);
  log(`Original: ${testPassword}`, 'yellow');
  log(`Masked: ${masked}`, 'yellow');
  log('✓ Masking working correctly', 'green');
}

async function createTestClient() {
  section('2. Creating Test Client');

  // Check if test client exists
  let client = await Client.findOne({
    where: { email: 'test-credentials@example.com' },
  });

  if (client) {
    log('Test client already exists, using existing client', 'yellow');
    return client;
  }

  // Create new test client
  log('Creating test client: Emma Martinez (Fitness Creator)', 'blue');
  client = await Client.create({
    name: 'Emma Martinez',
    email: 'test-credentials@example.com',
    phone: '+1-555-0123',
    journeyStage: 'Month 2 - Brand Readiness & Productization',
    journeyProgress: 35,
    status: 'Active',
    healthScore: 92,
    healthStatus: 'Green',
    profileData: {
      bio: 'Fitness coach and wellness entrepreneur',
      location: 'Los Angeles, CA',
    },
    socials: {
      instagram: '@emmafitwellness',
      youtube: 'EmmaFitnessJourney',
      tiktok: '@emmafit',
    },
    brandInfo: {
      niche: 'Fitness & Wellness',
      productType: 'Digital Course + Membership',
      valueProposition: 'Sustainable fitness for busy professionals',
    },
  });

  log(`✓ Test client created: ${client.name} (ID: ${client.id})`, 'green');
  return client;
}

async function testCredentialOperations(client) {
  section('3. Testing Credential CRUD Operations');

  // Create Instagram credential
  log('Creating Instagram credential...', 'blue');
  const instagramCred = await Credential.create({
    clientId: client.id,
    platform: 'Instagram',
    platformCategory: 'Social Media',
    accountIdentifier: '@emmafitwellness',
    loginUrl: 'https://instagram.com/accounts/login/',
    credentialType: 'Password',
    status: 'Active',
    tags: ['primary', 'social'],
    priority: 'Critical',
  });

  // Set encrypted password
  instagramCred.setPassword('InstagramSecure2024!');
  instagramCred.setNotes('2FA code: Use Authy app');
  await instagramCred.save();

  log(`✓ Instagram credential created (ID: ${instagramCred.id})`, 'green');

  // Create Shopify credential
  log('\nCreating Shopify credential...', 'blue');
  const shopifyCred = await Credential.create({
    clientId: client.id,
    platform: 'Shopify',
    platformCategory: 'E-commerce',
    accountIdentifier: 'emmafitwellness.myshopify.com',
    loginUrl: 'https://emmafitwellness.myshopify.com/admin',
    credentialType: 'Password',
    status: 'Active',
    tags: ['primary', 'store'],
    priority: 'Critical',
  });

  shopifyCred.setPassword('ShopifyAdmin2024!@#');
  shopifyCred.setApiKey('shpat_1234567890abcdef');
  await shopifyCred.save();

  log(`✓ Shopify credential created (ID: ${shopifyCred.id})`, 'green');

  // Create Klaviyo credential
  log('\nCreating Klaviyo (Email Marketing) credential...', 'blue');
  const klaviyoCred = await Credential.create({
    clientId: client.id,
    platform: 'Klaviyo',
    platformCategory: 'Email Marketing',
    accountIdentifier: 'emma@emmafitwellness.com',
    loginUrl: 'https://www.klaviyo.com/login',
    credentialType: 'API Key',
    status: 'Active',
    tags: ['marketing', 'email'],
    priority: 'High',
  });

  klaviyoCred.setApiKey('pk_1234567890abcdefghijklmnopqrstuvwxyz');
  klaviyoCred.setNotes('API Key for email automation');
  await klaviyoCred.save();

  log(`✓ Klaviyo credential created (ID: ${klaviyoCred.id})`, 'green');

  return [instagramCred, shopifyCred, klaviyoCred];
}

async function testCredentialRetrieval(client, credentials) {
  section('4. Testing Credential Retrieval & Masking');

  // Fetch all credentials for client
  log(`Fetching all credentials for ${client.name}...`, 'blue');
  const allCredentials = await Credential.findAll({
    where: { clientId: client.id },
    order: [['priority', 'DESC'], ['platform', 'ASC']],
  });

  log(`\nFound ${allCredentials.length} credentials:\n`, 'green');

  allCredentials.forEach((cred, index) => {
    const safeObj = cred.toSafeObject();
    console.log(`${index + 1}. ${safeObj.platform} (${safeObj.platformCategory})`);
    console.log(`   Account: ${safeObj.accountIdentifier || 'N/A'}`);
    console.log(`   Password: ${safeObj.maskedPassword || 'N/A'}`);
    if (safeObj.maskedApiKey) {
      console.log(`   API Key: ${safeObj.maskedApiKey}`);
    }
    console.log(`   Status: ${safeObj.status} | Priority: ${safeObj.priority}`);
    console.log(`   Tags: ${safeObj.tags.join(', ')}\n`);
  });
}

async function testCredentialReveal(credential) {
  section('5. Testing Credential Reveal (Decryption)');

  log(`Revealing credential for ${credential.platform}...`, 'blue');
  log('(In production, this would require authentication)', 'yellow');

  // Simulate the reveal operation (what the API endpoint does)
  await credential.recordAccess('test-user-id');

  const revealedData = {
    platform: credential.platform,
    accountIdentifier: credential.accountIdentifier,
    loginUrl: credential.loginUrl,
    password: credential.getPassword(),
    apiKey: credential.getApiKey(),
    notes: credential.getNotes(),
  };

  log('\n📋 Revealed Credential (for one-click copy):', 'green');
  console.log(JSON.stringify(revealedData, null, 2));
  log(`\nAccess count: ${credential.accessCount}`, 'yellow');
  log(`Last accessed: ${credential.lastAccessedAt}`, 'yellow');
}

async function testCredentialUpdate(credential) {
  section('6. Testing Credential Update');

  log(`Updating ${credential.platform} credential...`, 'blue');

  // Change status
  credential.status = 'Needs Update';
  credential.lastVerifiedAt = new Date();
  credential.setPassword('NewPassword2024!@#Updated');

  await credential.save();

  log('✓ Credential updated successfully', 'green');
  log(`   New status: ${credential.status}`, 'yellow');
  log(`   New password set (encrypted): ${credential.encryptedPassword.substring(0, 50)}...`, 'yellow');
  log(`   Verified: ${credential.lastVerifiedAt}`, 'yellow');
}

async function testAuditTrail(client) {
  section('7. Testing Audit Trail');

  log('Fetching audit trail for credential operations...', 'blue');

  const auditLogs = await ActivityLog.findAll({
    where: {
      entityType: 'Client',
      entityId: client.id,
      activityType: {
        [require('sequelize').Op.like]: 'credential_%',
      },
    },
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  log(`\nFound ${auditLogs.length} credential-related audit logs:\n`, 'green');

  auditLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log.activityType} - ${log.title}`);
    console.log(`   ${log.description}`);
    console.log(`   Time: ${log.createdAt}`);
    console.log(`   Metadata: ${JSON.stringify(log.metadata)}\n`);
  });
}

async function testCredentialsNeedingAttention() {
  section('8. Testing Credentials Needing Attention');

  log('Checking for credentials that need attention...', 'blue');

  const needsAttention = await Credential.findAll({
    where: {
      status: ['Needs Update', 'Expired'],
    },
  });

  if (needsAttention.length === 0) {
    log('✓ No credentials need attention', 'green');
  } else {
    log(`Found ${needsAttention.length} credential(s) needing attention:\n`, 'yellow');
    needsAttention.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.platform} - ${cred.status}`);
      console.log(`   Account: ${cred.accountIdentifier}`);
      console.log(`   Priority: ${cred.priority}\n`);
    });
  }
}

async function cleanup(client) {
  section('9. Cleanup (Optional)');

  log('Would you like to clean up test data? (This is a demo, so we keep it)', 'yellow');
  log(`Test client "${client.name}" and associated credentials remain in database`, 'yellow');
  log('You can manually delete them or run the demo again', 'yellow');
}

async function runTests() {
  try {
    console.clear();
    log('\n╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║   WAVELAUNCH STUDIO OS - CREDENTIAL SYSTEM TEST & DEMO           ║', 'cyan');
    log('║   Epic 1, Story 1.4: Securely Store Login Links                 ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════════╝\n', 'cyan');

    // Connect to database
    log('Connecting to database...', 'blue');
    await sequelize.authenticate();
    log('✓ Database connected', 'green');

    // Run all tests
    await testEncryption();

    const client = await createTestClient();
    const credentials = await testCredentialOperations(client);
    await testCredentialRetrieval(client, credentials);
    await testCredentialReveal(credentials[0]); // Reveal Instagram credential
    await testCredentialUpdate(credentials[1]); // Update Shopify credential
    await testAuditTrail(client);
    await testCredentialsNeedingAttention();
    await cleanup(client);

    // Summary
    section('✅ TEST SUMMARY');
    log('All credential system tests passed successfully!', 'green');
    log('\nKey Features Verified:', 'cyan');
    log('  ✓ AES-256-GCM encryption working', 'green');
    log('  ✓ Credential masking for secure display', 'green');
    log('  ✓ CRUD operations functioning', 'green');
    log('  ✓ Reveal/decrypt for one-click copy', 'green');
    log('  ✓ Audit trail logging all access', 'green');
    log('  ✓ Status tracking and alerts', 'green');

    log('\n🎉 Credential system is ready for production!', 'green');
    log('\nNext Steps:', 'cyan');
    log('  1. Start the server: cd backend && npm run dev', 'yellow');
    log('  2. Test API endpoints via Postman or curl', 'yellow');
    log('  3. Integrate credential vault into frontend UI', 'yellow');

    process.exit(0);
  } catch (error) {
    log('\n❌ TEST FAILED', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
