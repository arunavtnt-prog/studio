# Wavelaunch Studio CRM - Onboarding Kit System

## Overview

The Onboarding Kit System is a comprehensive 8-month transformation program that generates **40 consulting-grade documents** (5 per month) for creator-to-brand transformation. Each document is 10-25 pages, tailored to the creator's specific niche, audience, and goals.

## Features

### ✨ Key Capabilities

- **AI-Powered Document Generation**: Uses multi-provider LLM support (OpenAI, Claude, Gemini) to generate McKinsey-level strategic documents
- **8-Month Structured Program**: Month-by-month progression from Foundation to Market Domination
- **40 Deliverable Documents**: 5 consulting-grade documents per month (Strategies, Playbooks, Blueprints, Guides, SOPs, Kits, Frameworks, Reports, Dashboards, Plans)
- **Status Tracking**: Track document status (Generated → Sent → Viewed → Revision Requested → Approved)
- **Progress Management**: Automatic month unlocking when all documents are approved
- **Document Viewer**: Full markdown rendering with approval and revision request workflows
- **Tailored Content**: Every document is personalized to the creator's niche, audience, product type, and revenue goals

## System Architecture

### Backend Components

#### 1. Database Schema (`/backend/src/models/Client.js`)

Extended Client model with onboarding-specific fields:

```javascript
{
  // 8-Month Program Tracking
  currentMonth: Integer (1-8),
  completedMonths: Array<Integer>,
  monthProgress: JSONB,

  // Brand & Product Information
  brandInfo: JSONB,
  marketPosition: JSONB,
  contentAssets: JSONB,
  communityMetrics: JSONB,
  revenueGoals: JSONB,
  launchTimeline: JSONB,
  techStack: JSONB,
  teamStructure: JSONB,
  businessPlan: JSONB,

  // Documents Storage
  onboardingKits: JSONB // Stores all 40 documents and their statuses
}
```

#### 2. Document Templates (`/backend/src/utils/documentTemplates.js`)

Defines all 40 documents across 8 months:

- **Month 1 - Foundation Excellence**: Brand Architecture, Market Fortification, Visual Identity, Content Framework, Community Foundation
- **Month 2 - Brand Readiness & Productization**: Product Development, E-Commerce Infrastructure, Visual Assets Production, Content Production SOP, Operational Readiness
- **Month 3 - Market Entry Preparation**: Pre-Launch Campaign, Influencer & Affiliate Growth, Advertising Starter Kit, Content Engine Execution, Community Building
- **Month 4 - Sales Engine & Launch Infrastructure**: Conversion Optimization, Email & CRM Automation, Customer Experience, Analytics & Performance Dashboard, Scaling Partnerships
- **Month 5 - Pre-Launch Mastery**: Pre-Launch Simulation Report, Crisis & Reputation Management, Launch Event & Activation, Team & Creator Roles Matrix, Final Go-to-Market Plan
- **Month 6 - Soft Launch Execution**: Soft Launch Campaign Report, Content & Ad Optimization, Customer Feedback Loop System, Creator Performance Dashboard, Iteration & Improvement Roadmap
- **Month 7 - Scaling & Growth Systems**: Paid Media Scaling, Community Monetization Expansion, Influencer/Affiliate Scaling, Product Expansion, Team & Ops Scaling SOPs
- **Month 8 - Full Launch & Market Domination**: Full Launch Master Plan, Omnichannel Growth Strategy, Strategic Partnerships & Distribution, Brand Authority Building, Long-Term Scaling Roadmap

#### 3. Onboarding Kit Generator (`/backend/src/services/onboardingKitGenerator.js`)

Core AI document generation service:

- **`generateDocument(clientData, monthNumber, docNumber)`**: Generates a single document
- **`generateMonthDocuments(clientData, monthNumber)`**: Generates all 5 documents for a month
- **`readDocument(clientId, monthNumber, docNumber)`**: Retrieves a generated document
- **`getClientDocuments(clientId)`**: Lists all documents for a client

#### 4. API Routes (`/backend/src/routes/index.js`, `/backend/src/controllers/onboardingKitController.js`)

**Document Generation**:
- `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/generate` - Generate all month documents
- `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/generate` - Generate single document

**Document Retrieval**:
- `GET /api/v1/clients/:clientId/onboarding-kit/progress` - Get overall progress
- `GET /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber` - Get month documents
- `GET /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber` - Get single document (with content)

**Document Status Management**:
- `PUT /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/status` - Update status
- `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/revision` - Request revision
- `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/approve` - Approve document

**Month Completion**:
- `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/complete` - Complete month and unlock next

### Frontend Components

#### 1. OnboardingProgramDashboard (`/frontend/src/components/OnboardingProgramDashboard.jsx`)

Main dashboard component showing:
- Overall progress (0-100%)
- Stats (approved, generated, total documents)
- Month-by-month accordion view
- Document viewer modal

#### 2. MonthAccordion (`/frontend/src/components/MonthAccordion.jsx`)

Collapsible month section showing:
- Month status (Locked, Current, Completed)
- 5 documents with statuses
- "Generate All Documents" button
- Progress indicators

#### 3. DocumentCard (`/frontend/src/components/DocumentCard.jsx`)

Individual document card with:
- Document name
- Status badge (Not Generated, Generated, Sent, Viewed, Revision Requested, Approved)
- View button

#### 4. DocumentViewer (`/frontend/src/components/DocumentViewer.jsx`)

Full-screen modal for viewing documents:
- Markdown rendering with proper formatting
- Download button (Markdown format)
- Approve button
- Request Revision button with notes
- Status tracking

## Document Generation Process

### 1. AI Prompt Structure

Each document is generated using a comprehensive prompt that includes:

```javascript
{
  // Creator Context
  name: "Creator Name",
  niche: "Fitness & Wellness",
  followers: 259000,
  productType: "Supplement Line + Digital Program",

  // Brand Details
  valueProposition: "...",
  targetAudience: { demographics, psychographics, painPoints },
  differentiators: [...],
  competitors: [...],

  // Assets & Metrics
  platforms: ["Instagram", "YouTube", "TikTok"],
  emailListSize: 50000,
  engagementRate: 8.2,

  // Goals & Timeline
  softLaunchTarget: 500000,
  fullLaunchTarget: 2000000,
  softLaunchDate: "2025-06-01",
  fullLaunchDate: "2025-08-01",

  // Business Plan Context
  businessPlan: { parsedData: {...} }
}
```

### 2. Document Structure (Required for All)

1. **Executive Summary** (1-2 pages)
   - Bottom Line Up Front (BLUF)
   - Key Insights (3-5)
   - Critical Action Items (checkbox list)

2. **Brand Context** (2-3 pages)
   - Current state analysis
   - Why this matters for this specific creator
   - Application to their business

3. **Framework/Strategy** (4-6 pages)
   - Structured methodology
   - Visual frameworks
   - Industry benchmarks

4. **Standard Operating Procedures** (3-5 pages)
   - Step-by-step workflows
   - Checklists
   - Timeline for execution
   - Responsible parties

5. **Templates & Tools** (2-4 pages)
   - Ready-to-use templates
   - Sample scripts
   - Content calendars
   - Brand assets

6. **KPIs & Metrics** (1-2 pages)
   - Success metrics
   - Benchmarks for niche
   - Tracking dashboards
   - Health check scorecard

### 3. Quality Standards

- **McKinsey-level Clarity**: Professional, structured, actionable
- **Bain-style Frameworks**: Visual models, strategic analysis, data-driven
- **Startup Operator Execution**: Practical, no fluff, specific to creator's situation
- **10-25 Pages**: Approximately 8,000-20,000 tokens per document
- **Personalization**: Reference creator by name 10+ times, use their specific data points
- **Niche-Specific**: Every framework adapted to creator's niche (e.g., Fitness & Wellness, Beauty, Tech)
- **Actionable**: Prioritize execution over theory

## Usage Guide

### For Wavelaunch Team

#### Creating a New Client

1. **Create Client** with basic information
2. **Populate Brand Info** in Client model:
   - `brandInfo.niche`: e.g., "Fitness & Wellness"
   - `brandInfo.productType`: e.g., "Supplement Line"
   - `brandInfo.valueProposition`: Unique selling point
   - `brandInfo.targetAudience`: Demographics, psychographics, pain points
   - `marketPosition.competitors`: List of competitors
   - `marketPosition.differentiators`: What makes them unique
   - `contentAssets.platforms`: Social platforms
   - `communityMetrics.emailListSize`: Email subscribers
   - `revenueGoals.softLaunchTarget`: Month 6 revenue goal
   - `revenueGoals.fullLaunchTarget`: Month 8 revenue goal
   - `launchTimeline.softLaunchDate`: Target soft launch date
   - `launchTimeline.fullLaunchDate`: Target full launch date

3. **Navigate to Client Detail Page** → **Onboarding Tab**

4. **Month 1 Auto-Unlocked**: Click "Generate All Documents" for Month 1

5. **Wait for Generation**: Takes 2-5 minutes for all 5 documents (depends on LLM provider and token limits)

6. **Review Documents**: Click "View" on each document

7. **Approve or Request Revision**: Use buttons in Document Viewer

8. **Month Completion**: When all 5 documents approved, Month 2 auto-unlocks

#### Managing Revisions

1. **Client Requests Revision**: Click "Request Revision" in Document Viewer
2. **Enter Revision Notes**: Specific feedback on what needs to change
3. **Regenerate Document**: Click "Generate" on that specific document (creates Version 2)
4. **Review and Approve**: New version available for review

### For Developers

#### Adding New Document Types

1. **Update `documentTemplates.js`**:
   ```javascript
   MONTH_DELIVERABLES[9] = {
     name: 'Month 9 - Post-Launch Optimization',
     documents: [
       {
         id: '01-document-name',
         name: 'Document Name',
         type: 'Strategy',
         purpose: 'What this document accomplishes',
         estimatedPages: 20,
         estimatedTokens: 16000,
       },
       // ... 4 more documents
     ],
   };
   ```

2. **Update Client Model** to support Month 9:
   ```javascript
   monthProgress: {
     // ... existing months
     month9: { status: 'locked', completedAt: null, approvedAt: null },
   }
   ```

3. **Update Frontend** `MonthAccordion.jsx` to include Month 9 templates

#### Customizing Prompts

Edit `onboardingKitGenerator.js` → `buildDocumentPrompt()` function to:
- Add new context fields
- Modify document structure
- Change tone and style guidelines
- Adjust length requirements

#### Changing LLM Provider

Set in `.env`:
```bash
LLM_PROVIDER=claude  # or openai, gemini
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_MAX_TOKENS=16000
```

**Recommendations**:
- **OpenAI GPT-4**: Best for structured JSON (if using structured output)
- **Claude 3.5 Sonnet**: Best for long-form strategic documents (10-25 pages)
- **Gemini 1.5 Pro**: Most cost-effective for high-volume generation

## File Storage

Documents are stored in:
```
/uploads/onboarding-kits/{clientId}/
  ├── month-1/
  │   ├── 01-brand-architecture-strategy.md
  │   ├── 02-market-fortification-strategy.md
  │   ├── 03-visual-identity-strategy.md
  │   ├── 04-content-framework-strategy.md
  │   └── 05-community-foundation-strategy.md
  ├── month-2/
  │   └── ... (5 docs)
  └── ... through month-8/
```

## Environment Variables

Required in `/backend/.env`:

```bash
# LLM Provider (Multi-Provider Support)
LLM_PROVIDER=claude  # openai, claude, or gemini
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_MAX_TOKENS=16000

# API Keys (add keys for provider you're using)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...

# File Storage
UPLOADS_PATH=./uploads
```

See `LLM_SETUP.md` for complete multi-provider configuration guide.

## Future Enhancements (Phase 2 & 3)

### Phase 2
- [ ] Email integration: Auto-send documents when generated
- [ ] Business plan upload and parsing (extract key data automatically)
- [ ] PDF generation (convert Markdown to PDF)
- [ ] Document versioning (track revision history)
- [ ] Team collaboration (internal notes, @mentions)

### Phase 3
- [ ] Admin dashboard (see all clients' onboarding progress)
- [ ] Bulk generation (generate Month 1 for all new clients)
- [ ] Analytics (track engagement, approval rates, bottlenecks)
- [ ] Mobile optimization
- [ ] Document templates library (reusable sections)

## Testing

### Test Client: Gracie Thompson

Use this test client to verify system:

```javascript
{
  name: "Gracie Thompson",
  email: "gracie@graciefit.com",
  brandInfo: {
    niche: "Fitness & Wellness",
    productType: "Supplement Line + Digital Fitness Program",
    valueProposition: "Science-backed fitness for busy millennials",
    targetAudience: {
      demographics: "Females 24-38, $45K-$95K income, urban professionals",
      psychographics: "Health-conscious, time-constrained, evidence-driven",
      painPoints: [
        "Don't have time for 2-hour gym sessions",
        "Confused by conflicting fitness advice",
        "Skeptical of supplement claims"
      ]
    }
  },
  marketPosition: {
    competitors: [
      { name: "Gymshark", strength: "Apparel" },
      { name: "Alani Nu", strength: "Supplements" }
    ],
    differentiators: [
      "Exercise Science degree + content creator authenticity",
      "Transparent supplement formulations",
      "Realistic 'messy middle' messaging"
    ]
  },
  contentAssets: {
    platforms: ["Instagram", "TikTok", "YouTube"],
    contentLibrarySize: 500,
    postingFrequency: { instagram: "daily", tiktok: "2x daily", youtube: "weekly" }
  },
  communityMetrics: {
    emailListSize: 15000,
    engagementRate: 8.2
  },
  revenueGoals: {
    softLaunchTarget: 500000,
    fullLaunchTarget: 2000000
  },
  launchTimeline: {
    softLaunchDate: "2025-06-01",
    fullLaunchDate: "2025-08-01"
  },
  socials: {
    totalFollowers: 259000
  }
}
```

### Test Flow

1. Create Gracie as a client
2. Navigate to Onboarding tab
3. Click "Generate All Documents" for Month 1
4. Wait for generation (should create 5 documents in 2-5 minutes)
5. View each document - verify:
   - Name "Gracie Thompson" appears throughout
   - Niche-specific content (Fitness & Wellness)
   - 10-25 pages of content
   - Proper markdown formatting
   - McKinsey-level quality
6. Approve one document
7. Request revision on another (with notes)
8. Approve all 5 documents
9. Verify Month 2 unlocks

## Troubleshooting

### Documents Not Generating

**Error**: "LLM service returned empty content"

**Solutions**:
1. Check API keys in `.env`
2. Verify LLM provider is running
3. Check token limits (increase `LLM_MAX_TOKENS` if needed)
4. Review logs for specific error messages

### Document Quality Issues

**Problem**: Generic, not personalized content

**Solutions**:
1. Ensure client `brandInfo` is fully populated
2. Add more context to client profile (target audience, pain points, competitors)
3. Upload and parse business plan for additional context
4. Adjust temperature (lower = more consistent, higher = more creative)

### Month Not Unlocking

**Problem**: All documents approved but Month 2 still locked

**Solutions**:
1. Verify all 5 documents have `status: 'approved'`
2. Check `monthProgress` in database
3. Manually call `/complete` endpoint: `POST /api/v1/clients/:id/onboarding-kit/month/1/complete`

## Support

For issues or questions:
1. Check this README
2. Review `LLM_SETUP.md` for LLM configuration
3. Check backend logs for error messages
4. Review API endpoint responses for detailed error info

---

**Generated for Wavelaunch Studio CRM v1.0**
**Onboarding Kit System - Phase 1 MVP**
**Last Updated**: October 2025
