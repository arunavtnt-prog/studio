# Wavelaunch CRM - Backend

Modern, scalable backend API for the Wavelaunch Studio CRM & Client Automation Suite.

## 🏗️ Architecture

- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL with Sequelize ORM
- **AI/LLM**: OpenAI GPT-4
- **Email Integration**: Gmail API
- **Authentication**: JWT (ready to implement)

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations (create tables)
npm run migrate

# Optional: Seed with sample data
npm run seed
```

## 🚀 Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

- **Database**: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **OpenAI**: `OPENAI_API_KEY`, `OPENAI_MODEL`
- **Gmail API**: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
- **Server**: `PORT`, `NODE_ENV`

### Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Set redirect URI: `http://localhost:5000/api/v1/email/oauth/callback`
6. Use the OAuth flow to get a refresh token
7. Add credentials to `.env`

## 📚 API Endpoints

### Leads

- `POST /api/v1/leads` - Create new lead application
- `GET /api/v1/leads` - Get all leads (with filters)
- `GET /api/v1/leads/:id` - Get single lead
- `PATCH /api/v1/leads/:id` - Update lead
- `DELETE /api/v1/leads/:id` - Delete lead
- `POST /api/v1/leads/:id/analyze` - Run AI analysis

### Clients

- `POST /api/v1/clients` - Create client or convert from lead
- `GET /api/v1/clients` - Get all clients (with filters)
- `GET /api/v1/clients/:id` - Get full client profile
- `PATCH /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client
- `POST /api/v1/clients/:id/health-score` - Recalculate health score
- `POST /api/v1/clients/:id/deliverables` - Generate monthly deliverable
- `GET /api/v1/clients/:id/stats` - Get client statistics

## 🤖 AI/LLM Integration

### Customization Points

The LLM service (`src/services/llmService.js`) has several functions you can customize:

#### 1. Lead Analysis

```javascript
// Customize in: llmService.analyzeLeadApplication()
// TODO: Add your specific scoring criteria
// TODO: Adjust prompts to match your brand voice
```

#### 2. Onboarding Kit Generation

```javascript
// Customize in: llmService.generateOnboardingKit()
// TODO: Add your onboarding template
// TODO: Include company-specific resources
```

#### 3. Monthly Deliverables

```javascript
// Customize in: llmService.generateMonthlyDeliverable()
// TODO: Define your deliverable structure
// TODO: Add custom metrics and KPIs
```

### Using Custom Templates

Pass templates as parameters:

```javascript
// Example: Generate onboarding kit with custom template
const result = await llmService.generateOnboardingKit(
  clientData,
  myCustomTemplate
);
```

## 📊 Database Models

### Lead

Represents creator applications before onboarding.

**Key Fields**: `name`, `email`, `socials`, `niche`, `followers`, `engagement`, `stage`, `fitScore`, `aiAnalysis`

### Client

Onboarded creators with full project management.

**Key Fields**: `name`, `email`, `journeyStage`, `journeyProgress`, `healthScore`, `healthStatus`, `currentProject`

### File

Document and file management.

**Key Fields**: `filename`, `category`, `tags`, `metadata`, `isAiGenerated`

### Email

Synced email communications.

**Key Fields**: `subject`, `body`, `sentiment`, `direction`, `category`

### Milestone

Key objectives and achievements.

**Key Fields**: `title`, `status`, `progress`, `targetDate`, `impactOnHealth`, `triggerActions`

### HealthScoreLog

Historical health score tracking.

**Key Fields**: `healthScore`, `healthStatus`, `emailScore`, `milestoneScore`, `activityScore`, `progressScore`

### ActivityLog

Comprehensive activity timeline.

**Key Fields**: `activityType`, `title`, `description`, `metadata`

## 🔄 Automated Workflows

### 1. Onboarding Automation

Triggered when a client is created:

```javascript
await automationService.triggerOnboarding(clientId, options);
```

**Actions**:
- Generate personalized onboarding kit
- Create initial milestones
- Calculate baseline health score
- Log activities

### 2. Health Score Updates

Recalculates health scores based on:
- Email activity (25%)
- Milestone progress (30%)
- General activity (25%)
- Project progress (20%)

Run manually or schedule periodically:

```javascript
await healthScoreService.updateAllHealthScores();
```

### 3. Email Sync

Syncs emails from Gmail for all active clients:

```javascript
await emailService.syncAllClients();
```

**Features**:
- Sentiment analysis
- Topic extraction
- Automatic categorization
- Health score impact

### 4. Milestone Triggers

When milestones complete, trigger actions:

```javascript
await automationService.handleMilestoneCompletion(milestoneId);
```

**Possible Actions**:
- `send_email`
- `generate_document`
- `create_milestone`
- `update_health_score`

## 🎯 Health Score System

Health scores (0-100) with three statuses:

- **Green (80-100)**: Healthy, on track
- **Yellow (50-79)**: Needs attention
- **Red (0-49)**: At risk, urgent action

### Customization

Adjust weights in `.env`:

```env
HEALTH_SCORE_EMAIL_WEIGHT=0.25
HEALTH_SCORE_MILESTONE_WEIGHT=0.30
HEALTH_SCORE_ACTIVITY_WEIGHT=0.25
HEALTH_SCORE_PROGRESS_WEIGHT=0.20
```

Modify scoring logic in `src/services/healthScoreService.js`.

## 📈 Scaling Considerations

### Background Jobs

Set up cron jobs or task schedulers for:

- Email sync: Every 30 minutes
- Health score updates: Every hour
- Monthly deliverables: First of each month

Example with node-cron:

```javascript
const cron = require('node-cron');

// Sync emails every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await emailService.syncAllClients();
});

// Update health scores every hour
cron.schedule('0 * * * *', async () => {
  await healthScoreService.updateAllHealthScores();
});
```

### Database Optimization

- Add indexes for frequently queried fields (already included)
- Use database connection pooling (configured)
- Consider read replicas for scaling reads

### File Storage

Current: Local file system

For production, consider:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

Update file paths in File model and automationService.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- leadController.test.js

# Run with coverage
npm test -- --coverage
```

## 🔒 Security

- Helmet.js for security headers
- CORS enabled (configure allowed origins in production)
- Environment variables for sensitive data
- JWT authentication (implement in middleware)

## 📝 Extending the System

### Adding Custom Automations

1. Create function in `automationService.js`
2. Add trigger in milestone or client controller
3. Log activity for tracking

### Adding New Models

1. Create model file in `src/models/`
2. Define relationships in `src/models/index.js`
3. Create controller and routes
4. Update API documentation

### Custom LLM Functions

Add new functions to `llmService.js`:

```javascript
async customAnalysis(data, prompt) {
  // Your custom LLM logic
}
```

## 🐛 Troubleshooting

### Database Connection Issues

- Check PostgreSQL is running
- Verify credentials in `.env`
- Check firewall/network settings

### Gmail API Not Working

- Verify credentials are correct
- Check OAuth consent screen is configured
- Ensure refresh token is valid
- Check API quotas

### LLM/OpenAI Errors

- Verify API key is valid
- Check you have credits
- Monitor rate limits
- Review prompt token counts

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Check environment variables
4. Create an issue on GitHub

---

Built with ❤️ for Wavelaunch Studio
