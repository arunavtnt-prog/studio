# Wavelaunch Studio CRM & Client Automation Suite

A modern, scalable CRM system designed specifically for creator businesses. Built for Wavelaunch Studio to manage creator applications, client onboarding, project tracking, and automated workflows with AI-powered insights.

## ✨ Features

### 1. Lead Management & Application Processing
- Structured creator application intake
- AI-powered application analysis and scoring
- Sentiment analysis on applications
- Multi-stage lead pipeline (Warm → Interested → Almost Onboarded → Onboarded)
- Sortable and filterable applications view

### 2. Client Management ("Client Pages")
- Comprehensive dynamic client profiles
- Journey tracking through 4 stages:
  - **Foundation** - Initial setup and planning
  - **Prep** - Product development
  - **Launch** - Product launch and marketing
  - **Growth & Expansion** - Scaling and optimization
- Real-time progress tracking (0-100%)
- File and document management with AI-generated content
- Contract and brand materials storage
- Month-specific deliverables with AI generation

### 3. Email Integration & Communication Tracking
- Gmail API integration for automatic email sync
- Sentiment analysis on all communications
- Email frequency and recency tracking
- Automatic categorization and topic extraction
- Communication history linked to client profiles

### 4. Intelligent Health Scoring
- Real-time health scores (0-100) for every client
- Color-coded status: Green (80-100), Yellow (50-79), Red (0-49)
- Multi-factor calculation:
  - **Email Activity (25%)** - Communication patterns
  - **Milestone Progress (30%)** - Goal completion
  - **General Activity (25%)** - Engagement metrics
  - **Project Progress (20%)** - Journey advancement
- Automatic alerts for at-risk clients
- Historical health tracking and trends

### 5. Automated Workflows
- **Onboarding Automation**: Auto-generate personalized onboarding kits
- **Milestone Triggers**: Execute actions when milestones complete
- **Document Generation**: AI-created monthly deliverables
- **Health Monitoring**: Scheduled health score updates
- **Email Syncing**: Periodic communication sync

## 🏗️ Architecture

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL with Sequelize ORM
- **AI/LLM**: OpenAI GPT-4 Turbo
- **Email**: Gmail API with OAuth2
- **Architecture**: RESTful API, modular services

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: React hooks (scalable to Redux/Zustand)
- **UI**: Responsive, modern design with Heroicons

## 📂 Project Structure

```
wavelaunch-crm/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── models/         # Sequelize models (Lead, Client, File, etc.)
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic (LLM, Email, Health, Automation)
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration (database, etc.)
│   │   └── server.js       # Main server file
│   ├── tests/              # Unit and integration tests
│   ├── package.json
│   └── README.md
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── common/    # Reusable components
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   └── clients/
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # Global styles
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── scripts/               # Utility scripts
│   ├── seed.js           # Test data seeder
│   └── gracie-demo.js    # Gracie workflow demo
│
├── docs/                  # Additional documentation
│   ├── API.md            # API documentation
│   ├── WORKFLOWS.md      # Workflow descriptions
│   └── CUSTOMIZATION.md  # Customization guide
│
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- OpenAI API key
- Gmail API credentials (optional, for email features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wavelaunch-crm
```

2. **Set up the backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

3. **Set up the database**
```bash
# Create PostgreSQL database
createdb wavelaunch_crm

# Run migrations (creates tables)
npm run migrate

# Optional: Seed with test data
npm run seed
```

4. **Set up the frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
```

5. **Start the application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

6. **Access the application**
- Frontend: http://localhost:3000
- API Health Check: http://localhost:5000/api/v1/health

## 🎯 Workflow Demonstration: "Gracie" Test Data

We've included a complete workflow demonstration following a test creator named "Gracie" through the entire CRM system.

### Run the Gracie Demo

```bash
cd scripts
node gracie-demo.js
```

### Gracie's Journey

1. **Application** - Gracie submits her creator application
2. **AI Analysis** - System analyzes her fit (score: 88/100)
3. **Lead Progression** - Moves through stages: Warm → Interested → Almost Onboarded
4. **Onboarding** - Converts to client, triggers automation:
   - Personalized onboarding kit generated
   - Initial milestones created
   - Health score calculated (100 - Green status)
5. **Journey Progress** - Advances through Foundation stage (25% progress)
6. **Email Activity** - Simulated email communications synced
7. **Milestone Completion** - Completes "Complete Onboarding Forms"
8. **Health Score Updates** - Continuous monitoring and updates

After running the demo, you can view Gracie's complete profile in the frontend application.

## 🔧 Configuration & Customization

### Environment Variables

**Backend (.env)**:
- `DB_*` - Database connection
- `OPENAI_API_KEY` - For AI features
- `GMAIL_*` - For email sync
- `HEALTH_SCORE_*_WEIGHT` - Customize health score weights

**Frontend (.env)**:
- `VITE_API_BASE_URL` - Backend API URL

### LLM Customization Points

All AI functions are in `backend/src/services/llmService.js` with clear TODO markers:

#### 1. Lead Analysis
```javascript
// TODO: Customize the analysis prompt with your specific criteria
// TODO: Add industry-specific scoring factors
// TODO: Integrate with your brand guidelines
```

#### 2. Onboarding Kit Generation
```javascript
// TODO: Add your onboarding kit template
// TODO: Customize sections based on your onboarding process
// TODO: Add company-specific resources and links
```

#### 3. Monthly Deliverables
```javascript
// TODO: Define your monthly deliverable structure
// TODO: Add metrics and KPIs specific to each journey stage
// TODO: Customize based on client's niche and project type
```

### Passing Custom Templates

All LLM functions accept optional template parameters:

```javascript
// Generate onboarding kit with custom template
const result = await llmService.generateOnboardingKit(
  clientData,
  myCustomTemplate
);

// Analyze lead with custom guidelines
const analysis = await llmService.analyzeLeadApplication(
  leadData,
  myCustomGuidelines
);
```

### Health Score Customization

Adjust component weights in `.env`:

```env
HEALTH_SCORE_EMAIL_WEIGHT=0.25      # Email activity importance
HEALTH_SCORE_MILESTONE_WEIGHT=0.30  # Milestone completion importance
HEALTH_SCORE_ACTIVITY_WEIGHT=0.25   # General activity importance
HEALTH_SCORE_PROGRESS_WEIGHT=0.20   # Project progress importance
```

Modify scoring logic in `backend/src/services/healthScoreService.js`.

## 📊 Database Models

### Core Models

1. **Lead** - Creator applications before onboarding
2. **Client** - Onboarded creators with full project management
3. **File** - Document and asset management
4. **Email** - Synced communications with analysis
5. **Milestone** - Goal tracking with automation triggers
6. **HealthScoreLog** - Historical health data
7. **ActivityLog** - Complete activity timeline

### Relationships

```
Lead ──1:1──> Client
Client ──1:N──> Files
Client ──1:N──> Emails
Client ──1:N──> Milestones
Client ──1:N──> HealthScoreLogs
Client ──1:N──> ActivityLogs
```

## 🔄 Automated Workflows

### 1. Onboarding Automation
**Trigger**: New client created
**Actions**:
- Generate personalized onboarding kit (AI)
- Create initial milestones based on journey stage
- Calculate baseline health score
- Log all activities
- Optional: Send welcome email

### 2. Health Score Updates
**Trigger**: Scheduled (hourly) or manual
**Actions**:
- Calculate 4-component health score
- Update client health status (Green/Yellow/Red)
- Log score history
- Generate alerts for status changes
- Flag at-risk clients

### 3. Email Sync
**Trigger**: Scheduled (every 30 minutes)
**Actions**:
- Fetch new emails from Gmail
- Parse and extract content
- Run sentiment analysis (AI)
- Categorize and tag
- Update last contact date
- Impact health score

### 4. Milestone Completion
**Trigger**: Milestone marked complete
**Actions**:
- Execute configured trigger actions
- Update health score
- Generate follow-up documents (optional)
- Create next milestones (optional)
- Send notifications (optional)

### 5. Monthly Deliverable Generation
**Trigger**: Manual or scheduled (monthly)
**Actions**:
- Gather client progress data
- Compile milestone completions
- Analyze metrics and KPIs
- Generate document with AI
- Save as file
- Log activity

## 🔒 Security Considerations

- Environment variables for all sensitive data
- JWT authentication ready to implement
- Helmet.js security headers
- SQL injection protection via Sequelize
- CORS configuration
- Input validation with express-validator

## 📈 Scaling the System

### Background Jobs

Use cron scheduler for automated tasks:

```javascript
// Example with node-cron
const cron = require('node-cron');

// Email sync every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await emailService.syncAllClients();
});

// Health scores every hour
cron.schedule('0 * * * *', async () => {
  await healthScoreService.updateAllHealthScores();
});
```

### Database Optimization

- Indexes on frequently queried fields (included)
- Connection pooling (configured)
- Consider read replicas for scaling

### File Storage

Current: Local filesystem

For production:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when configured)
cd frontend
npm test
```

## 📚 API Documentation

### Key Endpoints

#### Leads
- `POST /api/v1/leads` - Create lead
- `GET /api/v1/leads` - List all leads
- `GET /api/v1/leads/:id` - Get lead details
- `POST /api/v1/leads/:id/analyze` - Run AI analysis

#### Clients
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients` - List all clients
- `GET /api/v1/clients/:id` - Get full client profile
- `PATCH /api/v1/clients/:id` - Update client
- `POST /api/v1/clients/:id/health-score` - Update health score
- `POST /api/v1/clients/:id/deliverables` - Generate deliverable
- `GET /api/v1/clients/:id/stats` - Get client statistics

See `docs/API.md` for complete API documentation.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Sequelize
- **Database**: PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS
- **AI/ML**: OpenAI GPT-4 Turbo
- **Email**: Gmail API
- **Charts**: Recharts
- **Icons**: Heroicons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check PostgreSQL is running
   - Verify credentials in .env
   - Ensure database exists

2. **Gmail API not working**
   - Complete OAuth setup
   - Verify credentials
   - Check refresh token

3. **OpenAI API errors**
   - Verify API key
   - Check credit balance
   - Monitor rate limits

4. **Frontend can't reach backend**
   - Check backend is running on port 5000
   - Verify VITE_API_BASE_URL in frontend/.env
   - Check CORS settings

## 📞 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Check documentation in `/docs`
- Review inline code comments

## 🎨 Screenshots

(Add screenshots of your application here)

---

**Built with ❤️ for Wavelaunch Studio**

A modern CRM solution for the creator economy, designed to scale with your business and automate the tedious parts of client management so you can focus on what matters: helping creators succeed.
