/**
 * Document Templates Configuration
 *
 * Defines all 40 onboarding documents (5 per month across 8 months)
 * for the Wavelaunch Studio Creator-to-Brand Transformation Program.
 *
 * Each document includes:
 * - name: Full document title
 * - type: Document category (Strategy, Playbook, Blueprint, etc.)
 * - purpose: What this document accomplishes
 * - estimatedPages: Target length (10-25 pages)
 * - estimatedTokens: Target token count (8000-20000)
 */

/**
 * All 8 Months Document Deliverables
 */
const MONTH_DELIVERABLES = {
  1: {
    name: 'Month 1 - Foundation Excellence',
    focus: 'Establishing core brand fundamentals, market positioning, and visual identity',
    context: 'This is the creator\'s first month. Focus on establishing core brand fundamentals, market positioning, and visual identity. The creator is transitioning from content creator to brand owner.',
    documents: [
      {
        id: '01-brand-architecture-strategy',
        name: 'Brand Architecture Strategy',
        type: 'Strategy',
        purpose: 'Establish the foundational brand structure, positioning, and identity framework that will guide all future brand decisions.',
        estimatedPages: 20,
        estimatedTokens: 16000,
      },
      {
        id: '02-market-fortification-strategy',
        name: 'Market Fortification Strategy',
        type: 'Strategy',
        purpose: 'Analyze the competitive landscape and develop a defensible market position.',
        estimatedPages: 18,
        estimatedTokens: 14000,
      },
      {
        id: '03-visual-identity-strategy',
        name: 'Visual Identity Strategy',
        type: 'Strategy',
        purpose: 'Create a comprehensive visual brand system including logo, colors, typography, and brand guidelines.',
        estimatedPages: 22,
        estimatedTokens: 17000,
      },
      {
        id: '04-content-framework-strategy',
        name: 'Content Framework Strategy',
        type: 'Strategy',
        purpose: 'Develop a systematic approach to content creation that aligns with brand objectives and audience needs.',
        estimatedPages: 19,
        estimatedTokens: 15000,
      },
      {
        id: '05-community-foundation-strategy',
        name: 'Community Foundation Strategy',
        type: 'Strategy',
        purpose: 'Build the foundation for a engaged, loyal community that will support the brand launch.',
        estimatedPages: 17,
        estimatedTokens: 13000,
      },
    ],
  },
  2: {
    name: 'Month 2 - Brand Readiness & Productization',
    focus: 'Developing product line and e-commerce infrastructure',
    context: 'The creator now has brand foundations and is ready to develop their product line and e-commerce infrastructure. Focus on turning concepts into concrete products.',
    documents: [
      {
        id: '01-product-development-playbook',
        name: 'Product Development Playbook',
        type: 'Playbook',
        purpose: 'Guide the creator through product ideation, validation, sourcing, and development with specific action steps.',
        estimatedPages: 25,
        estimatedTokens: 20000,
      },
      {
        id: '02-ecommerce-infrastructure-blueprint',
        name: 'E-Commerce Infrastructure Blueprint',
        type: 'Blueprint',
        purpose: 'Design and implement the complete e-commerce tech stack including platform selection, payment processing, and fulfillment.',
        estimatedPages: 23,
        estimatedTokens: 18000,
      },
      {
        id: '03-visual-assets-production-guide',
        name: 'Visual Assets Production Guide',
        type: 'Guide',
        purpose: 'Create professional product photography, packaging design, and marketing assets at scale.',
        estimatedPages: 20,
        estimatedTokens: 16000,
      },
      {
        id: '04-content-production-sop',
        name: 'Content Production SOP',
        type: 'SOP',
        purpose: 'Establish repeatable systems for creating, editing, and publishing content efficiently.',
        estimatedPages: 18,
        estimatedTokens: 14000,
      },
      {
        id: '05-operational-readiness-playbook',
        name: 'Operational Readiness Playbook',
        type: 'Playbook',
        purpose: 'Prepare all operational systems including inventory management, customer service, and quality control.',
        estimatedPages: 21,
        estimatedTokens: 17000,
      },
    ],
  },
  3: {
    name: 'Month 3 - Market Entry Preparation',
    focus: 'Building launch campaign and growth infrastructure',
    context: 'Products are developed, now preparing for market entry. Focus on building the pre-launch campaign and growth systems.',
    documents: [
      {
        id: '01-pre-launch-campaign-strategy',
        name: 'Pre-Launch Campaign Strategy',
        type: 'Strategy',
        purpose: 'Design and execute a comprehensive pre-launch campaign to build anticipation and early demand.',
        estimatedPages: 24,
        estimatedTokens: 19000,
      },
      {
        id: '02-influencer-affiliate-growth-playbook',
        name: 'Influencer & Affiliate Growth Playbook',
        type: 'Playbook',
        purpose: 'Recruit, onboard, and manage influencers and affiliates to amplify brand reach.',
        estimatedPages: 22,
        estimatedTokens: 17000,
      },
      {
        id: '03-advertising-starter-kit',
        name: 'Advertising Starter Kit',
        type: 'Kit',
        purpose: 'Launch profitable paid advertising campaigns across Meta, Google, TikTok with templates and targeting strategies.',
        estimatedPages: 25,
        estimatedTokens: 20000,
      },
      {
        id: '04-content-engine-execution-kit',
        name: 'Content Engine Execution Kit',
        type: 'Kit',
        purpose: 'Scale content production with batching systems, calendars, and repurposing frameworks.',
        estimatedPages: 19,
        estimatedTokens: 15000,
      },
      {
        id: '05-community-building-playbook',
        name: 'Community Building Playbook',
        type: 'Playbook',
        purpose: 'Grow and nurture the community through engagement tactics, exclusive perks, and brand ambassadors.',
        estimatedPages: 20,
        estimatedTokens: 16000,
      },
    ],
  },
  4: {
    name: 'Month 4 - Sales Engine & Launch Infrastructure',
    focus: 'Optimizing conversion and customer experience systems',
    context: 'Pre-launch campaigns are running. Now focus on conversion optimization and building the sales engine that will convert interest into revenue.',
    documents: [
      {
        id: '01-conversion-optimization-framework',
        name: 'Conversion Optimization Framework',
        type: 'Framework',
        purpose: 'Systematically improve website conversion rates through testing, copywriting, and user experience optimization.',
        estimatedPages: 23,
        estimatedTokens: 18000,
      },
      {
        id: '02-email-crm-automation-kit',
        name: 'Email & CRM Automation Kit',
        type: 'Kit',
        purpose: 'Implement automated email sequences, segmentation, and CRM workflows to nurture leads and maximize LTV.',
        estimatedPages: 24,
        estimatedTokens: 19000,
      },
      {
        id: '03-customer-experience-playbook',
        name: 'Customer Experience Playbook',
        type: 'Playbook',
        purpose: 'Design exceptional customer experiences from first touchpoint through post-purchase support.',
        estimatedPages: 21,
        estimatedTokens: 17000,
      },
      {
        id: '04-analytics-performance-dashboard',
        name: 'Analytics & Performance Dashboard',
        type: 'Dashboard',
        purpose: 'Build comprehensive analytics tracking and reporting dashboards to monitor all key metrics.',
        estimatedPages: 20,
        estimatedTokens: 16000,
      },
      {
        id: '05-scaling-partnerships-kit',
        name: 'Scaling Partnerships Kit',
        type: 'Kit',
        purpose: 'Identify, negotiate, and activate strategic partnerships with retailers, platforms, and co-marketing opportunities.',
        estimatedPages: 22,
        estimatedTokens: 17000,
      },
    ],
  },
  5: {
    name: 'Month 5 - Pre-Launch Mastery',
    focus: 'Final preparation and soft launch simulation',
    context: 'One month before soft launch. Focus on final testing, crisis preparation, and ensuring all systems are ready for go-live.',
    documents: [
      {
        id: '01-pre-launch-simulation-report',
        name: 'Pre-Launch Simulation Report',
        type: 'Report',
        purpose: 'Conduct full launch simulation testing all systems under load and documenting readiness across all functions.',
        estimatedPages: 25,
        estimatedTokens: 20000,
      },
      {
        id: '02-crisis-reputation-management-kit',
        name: 'Crisis & Reputation Management Kit',
        type: 'Kit',
        purpose: 'Prepare for potential crises with response playbooks, PR templates, and reputation monitoring systems.',
        estimatedPages: 19,
        estimatedTokens: 15000,
      },
      {
        id: '03-launch-event-activation-playbook',
        name: 'Launch Event & Activation Playbook',
        type: 'Playbook',
        purpose: 'Plan and execute memorable launch events (virtual/physical) that generate buzz and media coverage.',
        estimatedPages: 23,
        estimatedTokens: 18000,
      },
      {
        id: '04-team-creator-roles-matrix',
        name: 'Team & Creator Roles Matrix',
        type: 'Matrix',
        purpose: 'Define clear roles, responsibilities, and workflows for all team members during launch.',
        estimatedPages: 17,
        estimatedTokens: 13000,
      },
      {
        id: '05-final-go-to-market-plan',
        name: 'Final Go-to-Market Plan',
        type: 'Plan',
        purpose: 'Comprehensive final go-to-market strategy synthesizing all previous work into a detailed launch playbook.',
        estimatedPages: 24,
        estimatedTokens: 19000,
      },
    ],
  },
  6: {
    name: 'Month 6 - Soft Launch Execution',
    focus: 'Soft launch to limited audience and rapid iteration',
    context: 'Soft launch month. Focus on controlled release to limited audience, gathering feedback, and iterating quickly based on real customer data.',
    documents: [
      {
        id: '01-soft-launch-campaign-report',
        name: 'Soft Launch Campaign Report',
        type: 'Report',
        purpose: 'Document soft launch execution, analyze initial results, and identify optimization opportunities.',
        estimatedPages: 22,
        estimatedTokens: 17000,
      },
      {
        id: '02-content-ad-optimization-framework',
        name: 'Content & Ad Optimization Framework',
        type: 'Framework',
        purpose: 'Systematically test and optimize content and ads based on soft launch performance data.',
        estimatedPages: 21,
        estimatedTokens: 16000,
      },
      {
        id: '03-customer-feedback-loop-system',
        name: 'Customer Feedback Loop System',
        type: 'System',
        purpose: 'Implement systems to collect, analyze, and act on customer feedback in real-time.',
        estimatedPages: 18,
        estimatedTokens: 14000,
      },
      {
        id: '04-creator-performance-dashboard',
        name: 'Creator Performance Dashboard',
        type: 'Dashboard',
        purpose: 'Build real-time dashboards showing all critical metrics for the creator to monitor daily.',
        estimatedPages: 20,
        estimatedTokens: 16000,
      },
      {
        id: '05-iteration-improvement-roadmap',
        name: 'Iteration & Improvement Roadmap',
        type: 'Roadmap',
        purpose: 'Create prioritized roadmap of improvements and iterations based on soft launch learnings.',
        estimatedPages: 19,
        estimatedTokens: 15000,
      },
    ],
  },
  7: {
    name: 'Month 7 - Scaling & Growth Systems',
    focus: 'Scaling successful systems and expanding reach',
    context: 'Soft launch is complete with validated product-market fit. Now focus on scaling what works and building systems for sustainable growth.',
    documents: [
      {
        id: '01-paid-media-scaling-playbook',
        name: 'Paid Media Scaling Playbook',
        type: 'Playbook',
        purpose: 'Scale profitable ad campaigns while maintaining or improving ROAS through testing and optimization.',
        estimatedPages: 25,
        estimatedTokens: 20000,
      },
      {
        id: '02-community-monetization-expansion-plan',
        name: 'Community Monetization Expansion Plan',
        type: 'Plan',
        purpose: 'Expand revenue through community monetization strategies like memberships, courses, and exclusive products.',
        estimatedPages: 22,
        estimatedTokens: 17000,
      },
      {
        id: '03-influencer-affiliate-scaling-kit',
        name: 'Influencer/Affiliate Scaling Kit',
        type: 'Kit',
        purpose: 'Scale affiliate and influencer programs with automation, tiered commissions, and performance tracking.',
        estimatedPages: 21,
        estimatedTokens: 16000,
      },
      {
        id: '04-product-expansion-framework',
        name: 'Product Expansion Framework',
        type: 'Framework',
        purpose: 'Strategically expand product line with data-driven decisions about new SKUs and product categories.',
        estimatedPages: 23,
        estimatedTokens: 18000,
      },
      {
        id: '05-team-ops-scaling-sops',
        name: 'Team & Ops Scaling SOPs',
        type: 'SOP',
        purpose: 'Build scalable operational systems and hiring frameworks to support rapid growth without breaking.',
        estimatedPages: 24,
        estimatedTokens: 19000,
      },
    ],
  },
  8: {
    name: 'Month 8 - Full Launch & Market Domination',
    focus: 'Full market launch and long-term growth strategy',
    context: 'Final month. Full launch to entire market. Focus on maximum visibility, omnichannel expansion, and building sustainable competitive advantages.',
    documents: [
      {
        id: '01-full-launch-master-plan',
        name: 'Full Launch Master Plan',
        type: 'Plan',
        purpose: 'Execute comprehensive full launch strategy across all channels with coordinated campaigns and partnerships.',
        estimatedPages: 25,
        estimatedTokens: 20000,
      },
      {
        id: '02-omnichannel-growth-strategy',
        name: 'Omnichannel Growth Strategy',
        type: 'Strategy',
        purpose: 'Expand beyond DTC into retail, marketplaces, and other channels for maximum distribution.',
        estimatedPages: 24,
        estimatedTokens: 19000,
      },
      {
        id: '03-strategic-partnerships-distribution-kit',
        name: 'Strategic Partnerships & Distribution Kit',
        type: 'Kit',
        purpose: 'Secure major partnerships with retailers, platforms, and brands to accelerate growth and credibility.',
        estimatedPages: 23,
        estimatedTokens: 18000,
      },
      {
        id: '04-brand-authority-building-guide',
        name: 'Brand Authority Building Guide',
        type: 'Guide',
        purpose: 'Build long-term brand authority through PR, thought leadership, awards, and category ownership.',
        estimatedPages: 22,
        estimatedTokens: 17000,
      },
      {
        id: '05-long-term-scaling-roadmap',
        name: 'Long-Term Scaling Roadmap',
        type: 'Roadmap',
        purpose: 'Strategic roadmap for Year 2-3 growth including new markets, categories, and potential exit strategies.',
        estimatedPages: 24,
        estimatedTokens: 19000,
      },
    ],
  },
};

/**
 * Helper Functions
 */

/**
 * Get all documents for a specific month
 */
function getMonthDocuments(monthNumber) {
  return MONTH_DELIVERABLES[monthNumber] || null;
}

/**
 * Get a specific document by month and document number
 */
function getDocument(monthNumber, docNumber) {
  const month = MONTH_DELIVERABLES[monthNumber];
  if (!month) return null;
  return month.documents[docNumber - 1] || null;
}

/**
 * Get document name
 */
function getDocumentName(monthNumber, docNumber) {
  const doc = getDocument(monthNumber, docNumber);
  return doc ? doc.name : null;
}

/**
 * Get document type
 */
function getDocumentType(documentName) {
  // Find the document by name across all months
  for (const month of Object.values(MONTH_DELIVERABLES)) {
    const doc = month.documents.find((d) => d.name === documentName);
    if (doc) return doc.type;
  }
  return 'Document';
}

/**
 * Get document purpose
 */
function getDocumentPurpose(monthNumber, docNumber) {
  const doc = getDocument(monthNumber, docNumber);
  return doc ? doc.purpose : null;
}

/**
 * Get month context
 */
function getMonthContext(monthNumber) {
  const month = MONTH_DELIVERABLES[monthNumber];
  return month ? month.context : null;
}

/**
 * Get month name
 */
function getMonthName(monthNumber) {
  const month = MONTH_DELIVERABLES[monthNumber];
  return month ? month.name : null;
}

/**
 * Get month focus
 */
function getMonthFocus(monthNumber) {
  const month = MONTH_DELIVERABLES[monthNumber];
  return month ? month.focus : null;
}

/**
 * Get all month numbers
 */
function getAllMonths() {
  return Object.keys(MONTH_DELIVERABLES).map(Number);
}

/**
 * Get total number of documents across all months
 */
function getTotalDocuments() {
  return Object.values(MONTH_DELIVERABLES).reduce(
    (total, month) => total + month.documents.length,
    0
  );
}

/**
 * Get document file name (for storage)
 */
function getDocumentFileName(monthNumber, docNumber) {
  const doc = getDocument(monthNumber, docNumber);
  if (!doc) return null;
  return `${doc.id}.md`;
}

/**
 * Get style guidelines for document generation
 */
function getStyleGuidelines() {
  return {
    tone: 'Professional but not stuffy',
    approach: 'McKinsey clarity + Bain frameworks + startup-operator execution mindset',
    voice: 'Empowering and action-oriented',
    format: 'Markdown with clear headers, bullet points, tables, and blockquotes',
    length: '10-25 pages (8,000-20,000 tokens)',
    critical: [
      'NO generic one-size-fits-all advice',
      'EVERY recommendation must be tailored to the creator\'s niche',
      'Reference creator by name throughout',
      'Use their specific data points',
      'Avoid buzzwords and filler text',
      'Prioritize actionability over theory',
    ],
  };
}

/**
 * Get document structure requirements
 */
function getDocumentStructure() {
  return [
    {
      section: 'Executive Summary',
      pages: '1-2',
      content: [
        'Concise overview of key insights and recommendations',
        '3-5 most critical action items',
        'Why this document matters for the creator',
        'Bottom Line Up Front (BLUF) section',
      ],
    },
    {
      section: 'Brand Context',
      pages: '2-3',
      content: [
        'How this strategy applies to creator\'s specific niche',
        'Reference unique value proposition and differentiators',
        'Adapt recommendations to their target audience',
        'Address specific pain points',
        'Consider competitive landscape',
      ],
    },
    {
      section: 'Framework/Strategy',
      pages: '4-6',
      content: [
        'Structured methodology',
        'Visual frameworks (described in text)',
        'Consulting-grade frameworks (SWOT, Porter\'s Five Forces, etc.)',
        'Decision trees and prioritization matrices',
        'Industry benchmarks',
      ],
    },
    {
      section: 'Standard Operating Procedures (SOPs)',
      pages: '3-5',
      content: [
        'Step-by-step workflows',
        'Clear checklists with checkboxes',
        'Timeline for execution',
        'Responsible parties',
        'Prerequisites and dependencies',
        'Quality control checkpoints',
      ],
    },
    {
      section: 'Templates & Tools',
      pages: '2-4',
      content: [
        'Pre-built templates',
        'Sample scripts',
        'Content calendars',
        'Outreach templates',
        'Brand asset examples',
        'Sample customer personas',
      ],
    },
    {
      section: 'KPIs & Metrics',
      pages: '1-2',
      content: [
        'Success metrics for this deliverable',
        'Benchmarks for the niche',
        'Tracking dashboards (describe format)',
        'Targets for current month and beyond',
        'Progress measurement methods',
        'Health Check scorecard',
      ],
    },
  ];
}

module.exports = {
  MONTH_DELIVERABLES,
  getMonthDocuments,
  getDocument,
  getDocumentName,
  getDocumentType,
  getDocumentPurpose,
  getMonthContext,
  getMonthName,
  getMonthFocus,
  getAllMonths,
  getTotalDocuments,
  getDocumentFileName,
  getStyleGuidelines,
  getDocumentStructure,
};
