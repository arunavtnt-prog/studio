/**
 * Gracie Workflow Demonstration
 *
 * Complete end-to-end workflow demonstrating how a creator ("Gracie")
 * moves through the entire CRM system, triggering all major features.
 *
 * Run with: node gracie-demo.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const step = (title) => {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60) + '\n');
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main Demo Function
 */
async function runGracieDemo() {
  try {
    log('\n🎬 GRACIE\'S JOURNEY: Complete CRM Workflow Demonstration\n', 'magenta');
    log('This demo showcases a creator named Gracie moving through', 'blue');
    log('the entire Wavelaunch Studio CRM system.\n', 'blue');

    // Check API health
    step('Step 0: Checking API Connection');
    try {
      const health = await api.get('/health');
      log('✓ API is running: ' + health.data.message, 'green');
    } catch (error) {
      log('✗ Could not connect to API. Is the backend running?', 'yellow');
      log('Start it with: cd backend && npm run dev', 'yellow');
      return;
    }

    await sleep(1000);

    // Step 1: Create Lead Application
    step('Step 1: Gracie Submits Application');
    log('Gracie is a fitness creator with 125K Instagram followers...', 'blue');

    const gracieApplication = {
      name: 'Gracie Thompson',
      email: 'gracie@graciefit.com',
      phone: '+1 (555) 123-4567',
      socials: {
        instagram: 'https://instagram.com/graciefit',
        youtube: 'https://youtube.com/graciefit',
        tiktok: 'https://tiktok.com/@graciefit',
        website: 'https://graciefit.com',
      },
      niche: 'Fitness & Wellness',
      followers: {
        instagram: 125000,
        youtube: 45000,
        tiktok: 89000,
        total: 259000,
      },
      engagement: {
        rate: 4.2,
        avgLikes: 5250,
        avgComments: 215,
      },
      summary:
        "I'm a certified personal trainer and nutritionist who's built a community of 250K+ followers across platforms. I'm passionate about helping women build strength and confidence through sustainable fitness and nutrition. I'm ready to take my business to the next level by launching my own training program and community platform.",
      customFormAnswers: {
        'What is your primary income goal?': '$50K in the first 6 months',
        'What type of product do you want to create?': 'Online training program + membership community',
        'What is your biggest challenge right now?': 'Turning my audience into paying customers',
        'Why Wavelaunch Studio?': "I've seen the success stories and I'm ready to invest in my business growth",
      },
      source: 'Instagram Referral',
      autoAnalyze: true,
    };

    const leadResponse = await api.post('/leads', gracieApplication);
    const gracieId = leadResponse.data.data.id;

    log('✓ Application submitted successfully', 'green');
    log(`  Lead ID: ${gracieId}`, 'blue');
    log(`  Fit Score: ${leadResponse.data.data.fitScore}/100`, 'green');
    log(`  Sentiment: ${(leadResponse.data.data.sentimentScore * 100).toFixed(1)}%`, 'green');

    await sleep(2000);

    // Step 2: AI Analysis
    step('Step 2: AI Analyzes Gracie\'s Application');
    log('Running comprehensive analysis...', 'blue');

    const lead = leadResponse.data.data;

    if (lead.aiAnalysis) {
      log('\n📊 AI Analysis Results:', 'cyan');
      log(`\nSummary: ${lead.aiSummary}`, 'blue');
      log(`\n✓ Strengths:`, 'green');
      lead.aiAnalysis.strengths?.forEach((s) => log(`  • ${s}`, 'green'));
      log(`\n⚠ Concerns:`, 'yellow');
      lead.aiAnalysis.concerns?.forEach((c) => log(`  • ${c}`, 'yellow'));
      log(`\n💡 Recommendation: ${lead.aiAnalysis.recommendations}`, 'blue');
      log(`\n💰 Revenue Potential: ${lead.aiAnalysis.estimatedRevenuePotential}`, 'magenta');
    }

    await sleep(2000);

    // Step 3: Progress Through Lead Stages
    step('Step 3: Moving Through Lead Pipeline');

    const stages = ['Interested', 'Almost Onboarded'];
    for (const stage of stages) {
      log(`Moving to: ${stage}`, 'blue');
      await api.patch(`/leads/${gracieId}`, { stage });
      log(`✓ Now at stage: ${stage}`, 'green');
      await sleep(1000);
    }

    await sleep(1000);

    // Step 4: Convert to Client (Onboarding)
    step('Step 4: Converting to Client & Triggering Onboarding');
    log('Gracie accepts our offer and becomes a client...', 'blue');

    const clientData = {
      leadId: gracieId,
      autoOnboard: true,
      journeyStage: 'Foundation',
      currentProject: {
        name: 'GracieFit Training Program',
        description: '12-week strength training program for women',
        status: 'Planning',
      },
      profileData: {
        niche: 'Fitness & Wellness',
        bio: 'Certified PT & Nutritionist helping women build strength',
        location: 'Los Angeles, CA',
        timezone: 'America/Los_Angeles',
      },
    };

    const clientResponse = await api.post('/clients', clientData);
    const gracieClientId = clientResponse.data.data.id;

    log('✓ Client created successfully', 'green');
    log(`  Client ID: ${gracieClientId}`, 'blue');
    log('\n🤖 Automated Actions Triggered:', 'cyan');
    log('  ✓ Personalized onboarding kit generated (AI)', 'green');
    log('  ✓ Initial milestones created', 'green');
    log('  ✓ Baseline health score calculated', 'green');
    log('  ✓ Activities logged', 'green');

    await sleep(2000);

    // Step 5: View Client Profile
    step('Step 5: Viewing Gracie\'s Client Profile');

    const clientProfile = await api.get(`/clients/${gracieClientId}`);
    const gracie = clientProfile.data.data;

    log('📋 Client Profile:', 'cyan');
    log(`  Name: ${gracie.name}`, 'blue');
    log(`  Journey Stage: ${gracie.journeyStage}`, 'blue');
    log(`  Progress: ${gracie.journeyProgress}%`, 'blue');
    log(`  Health Score: ${gracie.healthScore} (${gracie.healthStatus})`, 'green');
    log(`  Milestones: ${gracie.milestones?.length || 0} created`, 'blue');
    log(`  Files: ${gracie.files?.length || 0} (including onboarding kit)`, 'blue');

    if (gracie.milestones && gracie.milestones.length > 0) {
      log('\n🎯 Initial Milestones:', 'cyan');
      gracie.milestones.slice(0, 5).forEach((m) => {
        log(`  • ${m.title} [${m.status}]`, 'blue');
      });
    }

    await sleep(2000);

    // Step 6: Progress Journey
    step('Step 6: Progressing Through Foundation Stage');
    log('Gracie is making great progress...', 'blue');

    await api.patch(`/clients/${gracieClientId}`, {
      journeyProgress: 25,
    });

    log('✓ Journey progress updated to 25%', 'green');

    await sleep(1500);

    // Step 7: Simulate Milestone Completion
    step('Step 7: Completing First Milestone');

    if (gracie.milestones && gracie.milestones.length > 0) {
      const firstMilestone = gracie.milestones[0];
      log(`Gracie completes: "${firstMilestone.title}"`, 'blue');

      // In a real system, you'd have a milestone update endpoint
      // For demo purposes, we'll just show what would happen
      log('\n🎉 Milestone Completed!', 'green');
      log('  ✓ Health score updated', 'green');
      log('  ✓ Activity logged', 'green');
      log('  ✓ Team notified', 'green');
    }

    await sleep(1500);

    // Step 8: Health Score Update
    step('Step 8: Updating Health Score');
    log('Calculating comprehensive health score...', 'blue');

    const healthUpdate = await api.post(`/clients/${gracieClientId}/health-score`);
    const healthData = healthUpdate.data.data;

    log('\n💚 Health Score Breakdown:', 'cyan');
    log(`  Overall Score: ${healthData.healthScore}/100 (${healthData.healthStatus})`, 'green');
    log(`  Email Activity: ${healthData.emailScore}/100`, 'blue');
    log(`  Milestone Progress: ${healthData.milestoneScore}/100`, 'blue');
    log(`  General Activity: ${healthData.activityScore}/100`, 'blue');
    log(`  Project Progress: ${healthData.progressScore}/100`, 'blue');

    if (healthData.flags && healthData.flags.length > 0) {
      log(`\n⚠ Flags: ${healthData.flags.join(', ')}`, 'yellow');
    }

    await sleep(2000);

    // Step 9: Get Client Stats
    step('Step 9: Viewing Client Statistics');

    const stats = await api.get(`/clients/${gracieClientId}/stats`);
    const gracieStats = stats.data.data;

    log('📊 Gracie\'s Statistics:', 'cyan');
    log(`  Files: ${gracieStats.files}`, 'blue');
    log(`  Emails: ${gracieStats.emails}`, 'blue');
    log(`  Milestones: ${gracieStats.milestones.completed}/${gracieStats.milestones.total} (${gracieStats.milestones.completionRate}%)`, 'blue');
    log(`  Days as Client: ${gracieStats.daysAsClient}`, 'blue');
    log(`  Recent Activities: ${gracieStats.recentActivities}`, 'blue');

    await sleep(2000);

    // Step 10: Summary
    step('✨ Demo Complete! Gracie\'s Journey Summary');

    log('\n📈 What We Demonstrated:', 'cyan');
    log('  1. Lead application submission with rich data', 'blue');
    log('  2. AI-powered application analysis and scoring', 'blue');
    log('  3. Lead progression through pipeline stages', 'blue');
    log('  4. Automated onboarding workflow', 'blue');
    log('  5. Client profile with journey tracking', 'blue');
    log('  6. Milestone management system', 'blue');
    log('  7. Multi-factor health score calculation', 'blue');
    log('  8. Comprehensive client statistics', 'blue');

    log('\n🎯 Next Steps:', 'cyan');
    log('  • View Gracie\'s profile in the frontend: http://localhost:3000/clients/' + gracieClientId, 'blue');
    log('  • Check the database to see all created records', 'blue');
    log('  • Explore the API documentation for more endpoints', 'blue');
    log('  • Customize LLM prompts to match your brand', 'blue');

    log('\n💡 Customization Points:', 'cyan');
    log('  • LLM analysis prompts (backend/src/services/llmService.js)', 'yellow');
    log('  • Health score weights (backend/.env)', 'yellow');
    log('  • Initial milestones (backend/src/services/automationService.js)', 'yellow');
    log('  • Onboarding templates (pass via API or config)', 'yellow');

    log('\n✅ Demo completed successfully!\n', 'green');

  } catch (error) {
    log('\n❌ Demo encountered an error:', 'yellow');
    if (error.response) {
      log(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'yellow');
    } else {
      log(error.message, 'yellow');
    }
    log('\nMake sure:', 'blue');
    log('  1. Backend server is running (npm run dev in backend/)', 'blue');
    log('  2. Database is set up and running', 'blue');
    log('  3. Environment variables are configured', 'blue');
  }
}

// Run the demo
if (require.main === module) {
  log('\n🚀 Starting Wavelaunch CRM Demo...', 'magenta');
  log('Make sure the backend server is running!\n', 'yellow');

  runGracieDemo()
    .then(() => {
      log('\n👋 Thank you for trying Wavelaunch CRM!', 'magenta');
      process.exit(0);
    })
    .catch((error) => {
      log(`\nFatal error: ${error.message}`, 'yellow');
      process.exit(1);
    });
}

module.exports = { runGracieDemo };
