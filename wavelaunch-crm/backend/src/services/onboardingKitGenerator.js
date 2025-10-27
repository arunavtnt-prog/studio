/**
 * Onboarding Kit Generator Service
 *
 * Generates consulting-grade onboarding documents for Wavelaunch Studio
 * 8-month creator-to-brand transformation program.
 *
 * Uses multi-provider LLM service (OpenAI, Claude, Gemini) to create
 * 10-25 page documents tailored to each creator's niche, audience, and goals.
 */

const llmService = require('./llmService');
const fs = require('fs').promises;
const path = require('path');
const {
  getDocument,
  getDocumentName,
  getDocumentType,
  getDocumentPurpose,
  getMonthContext,
  getMonthName,
  getMonthFocus,
  getDocumentFileName,
  getStyleGuidelines,
  getDocumentStructure,
} = require('../utils/documentTemplates');

class OnboardingKitGenerator {
  constructor() {
    this.uploadsDir = process.env.UPLOADS_PATH || './uploads';
    this.onboardingKitsDir = path.join(this.uploadsDir, 'onboarding-kits');
  }

  /**
   * Ensure directory exists
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Get client-specific uploads directory
   */
  getClientDirectory(clientId) {
    return path.join(this.onboardingKitsDir, clientId);
  }

  /**
   * Get month-specific directory
   */
  getMonthDirectory(clientId, monthNumber) {
    return path.join(this.getClientDirectory(clientId), `month-${monthNumber}`);
  }

  /**
   * Build comprehensive AI prompt for document generation
   */
  buildDocumentPrompt(clientData, monthNumber, docNumber) {
    const document = getDocument(monthNumber, docNumber);
    if (!document) {
      throw new Error(`Document not found: Month ${monthNumber}, Doc ${docNumber}`);
    }

    const documentName = document.name;
    const documentType = document.type;
    const documentPurpose = document.purpose;
    const monthContext = getMonthContext(monthNumber);
    const monthName = getMonthName(monthNumber);
    const styleGuidelines = getStyleGuidelines();
    const structure = getDocumentStructure();

    // Extract client data with safe defaults
    const name = clientData.name || 'Creator';
    const niche = clientData.brandInfo?.niche || clientData.profileData?.niche || 'Not specified';
    const productType = clientData.brandInfo?.productType || 'Product line';
    const followers = clientData.socials?.totalFollowers || 0;
    const valueProposition = clientData.brandInfo?.valueProposition || 'Building an authentic brand';

    const targetAudience = clientData.brandInfo?.targetAudience || {};
    const demographics = targetAudience.demographics || 'Core audience';
    const painPoints = targetAudience.painPoints || [];

    const marketPosition = clientData.marketPosition || {};
    const differentiators = marketPosition.differentiators || [];
    const competitors = marketPosition.competitors || [];

    const contentAssets = clientData.contentAssets || {};
    const platforms = contentAssets.platforms || [];

    const communityMetrics = clientData.communityMetrics || {};
    const emailListSize = communityMetrics.emailListSize || 0;
    const engagementRate = communityMetrics.engagementRate || 0;

    const revenueGoals = clientData.revenueGoals || {};
    const softLaunchTarget = revenueGoals.softLaunchTarget || 0;
    const fullLaunchTarget = revenueGoals.fullLaunchTarget || 0;

    const launchTimeline = clientData.launchTimeline || {};
    const softLaunchDate = launchTimeline.softLaunchDate || 'TBD';
    const fullLaunchDate = launchTimeline.fullLaunchDate || 'TBD';

    const techStack = clientData.techStack || {};
    const ecommercePlatform = techStack.ecommercePlatform || 'To be determined';
    const emailProvider = techStack.emailProvider || 'To be determined';

    // Build business plan context
    let businessPlanContext = '';
    if (clientData.businessPlan?.uploaded && clientData.businessPlan?.parsedData) {
      businessPlanContext = `
## Business Plan Context
${name} has uploaded their business plan. Key highlights:
${JSON.stringify(clientData.businessPlan.parsedData, null, 2)}
`;
    } else {
      businessPlanContext = `
## Business Plan Context
No business plan uploaded yet. Generate based on provided context and best practices for the ${niche} niche.
`;
    }

    const systemPrompt = `You are a senior business strategist and consultant for Wavelaunch Studio, a premium creator-to-brand transformation agency.

Your expertise:
- McKinsey-level strategic clarity
- Bain-style frameworks and analysis
- Startup operator execution mindset
- Deep knowledge of creator economy and e-commerce
- Experience scaling brands from $0 to $10M+

You are creating deliverable documents for an 8-month transformation program that converts content creators into profitable brand owners.

Style Requirements:
- Tone: ${styleGuidelines.tone}
- Approach: ${styleGuidelines.approach}
- Format: ${styleGuidelines.format}
- Target Length: ${styleGuidelines.length}

Critical Rules:
${styleGuidelines.critical.map((rule) => `- ${rule}`).join('\n')}

Document Structure (MUST FOLLOW):
${structure.map((s) => `
### ${s.section} (${s.pages} pages)
${s.content.map((c) => `- ${c}`).join('\n')}
`).join('\n')}

Your document must be actionable, data-driven, and specific to this creator's unique situation.`;

    const userPrompt = `# WAVELAUNCH STUDIO - ${documentName.toUpperCase()}

## Creator Profile

**Name:** ${name}
**Niche:** ${niche}
**Audience Size:** ${followers.toLocaleString()} followers
**Product Type:** ${productType}
**Current Month:** Month ${monthNumber} - ${monthName}
**Primary Goals:** $${fullLaunchTarget.toLocaleString()} revenue by full launch

## Brand Details

**Value Proposition:** ${valueProposition}

**Target Audience:**
- Demographics: ${demographics}
${painPoints.length > 0 ? `- Pain Points: ${painPoints.join(', ')}` : ''}

${differentiators.length > 0 ? `**Key Differentiators:**
${differentiators.map((d) => `- ${d}`).join('\n')}` : ''}

${competitors.length > 0 ? `**Main Competitors:**
${competitors.map((c) => `- ${c.name}${c.strength ? ` (${c.strength})` : ''}`).join('\n')}` : ''}

## Current Assets & Metrics

${platforms.length > 0 ? `**Platforms:** ${platforms.join(', ')}` : ''}
${emailListSize > 0 ? `**Email List:** ${emailListSize.toLocaleString()} subscribers` : ''}
${engagementRate > 0 ? `**Engagement Rate:** ${engagementRate}%` : ''}

## Tech Stack & Infrastructure

- **E-commerce Platform:** ${ecommercePlatform}
- **Email Provider:** ${emailProvider}

## Launch Timeline

- **Soft Launch Target:** ${typeof softLaunchDate === 'string' ? softLaunchDate : new Date(softLaunchDate).toLocaleDateString()}
- **Full Launch Target:** ${typeof fullLaunchDate === 'string' ? fullLaunchDate : new Date(fullLaunchDate).toLocaleDateString()}
- **Soft Launch Revenue Goal:** $${softLaunchTarget.toLocaleString()}
- **Full Launch Revenue Goal:** $${fullLaunchTarget.toLocaleString()}

${businessPlanContext}

---

# DOCUMENT REQUIREMENTS

You are creating a **${documentType}** titled **"${documentName}"** for ${name}.

**Month ${monthNumber} Context:**
${monthContext}

**Month ${monthNumber} Focus:**
${getMonthFocus(monthNumber)}

**Document Purpose:**
${documentPurpose}

---

# DELIVERABLE

Generate the complete **${documentName}** document following this exact structure:

1. **Title Page**
   - Document title
   - ${name}'s name and niche
   - Generation date
   - Wavelaunch Studio attribution
   - Document version

2. **Executive Summary** (1-2 pages)
   - Bottom Line Up Front (BLUF): Single paragraph with core recommendation
   - Key Insights: 3-5 critical takeaways
   - Critical Action Items: Checkbox list of must-dos for next 30 days

3. **Brand Context** (2-3 pages specific to ${name})
   - Current state analysis
   - Why this ${documentType.toLowerCase()} matters for ${name}'s ${niche} brand
   - Specific application to their ${productType} business
   - Alignment with their ${fullLaunchTarget > 0 ? `$${fullLaunchTarget.toLocaleString()} revenue goal` : 'business objectives'}

4. **Framework/Strategy** (4-6 pages)
   - Structured methodology
   - Visual frameworks (describe in text/tables)
   - Industry-specific frameworks for ${niche}
   - Decision matrices and prioritization models
   - Competitive benchmarks

5. **Standard Operating Procedures** (3-5 pages)
   - Step-by-step workflows with clear numbered steps
   - Checklists with checkboxes [ ]
   - Timeline (weekly/monthly breakdown)
   - Responsible parties (${name}, Wavelaunch Team, Contractors)
   - Prerequisites and dependencies
   - Quality checkpoints

6. **Templates & Tools** (2-4 pages)
   - Ready-to-use templates
   - Sample scripts (email, social, ad copy)
   - Content calendars
   - Frameworks specific to ${niche}
   - ${productType}-specific tools
   - Customer persona templates

7. **KPIs & Metrics** (1-2 pages)
   - Success metrics for Month ${monthNumber}
   - ${niche} industry benchmarks
   - Tracking dashboard descriptions
   - Target metrics by timeline
   - Health check scorecard

8. **Next Steps** (1 page)
   - Week 1-4 breakdown
   - Clear action items with deadlines
   - Resource requirements
   - Expected outcomes

9. **Appendices** (optional, 2-3 pages)
   - Case studies relevant to ${niche}
   - Competitor analysis
   - Additional templates
   - Reference materials

---

**Formatting Requirements:**
- Use Markdown syntax
- Clear H1, H2, H3 headers
- Bullet points for lists
- Tables for comparisons and frameworks
- Blockquotes for key insights (> )
- Code blocks for templates (\`\`\`markdown)
- Bold for critical points (**text**)
- MUST be 10-25 pages when rendered (approximately ${document.estimatedTokens.toLocaleString()} tokens)

**Quality Standards:**
- Reference ${name} by name at least 10 times throughout
- Include specific data points (${followers.toLocaleString()} followers, ${emailListSize.toLocaleString()} email subscribers, etc.)
- Every framework must be adapted to ${niche}
- Every example must be relevant to ${productType}
- No generic advice - everything must be actionable and specific
- Professional tone but warm and encouraging
- Consultant-grade quality (McKinsey clarity + Bain frameworks + operator execution)

---

Generate the COMPLETE document now. Do NOT summarize or abbreviate. Create the full 10-25 page deliverable.`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Generate a single document
   */
  async generateDocument(clientData, monthNumber, docNumber, options = {}) {
    try {
      console.log(`[OnboardingKit] Generating document: Month ${monthNumber}, Doc ${docNumber} for ${clientData.name}`);

      // Build the prompt
      const { systemPrompt, userPrompt } = this.buildDocumentPrompt(clientData, monthNumber, docNumber);

      // Get document metadata
      const document = getDocument(monthNumber, docNumber);
      const documentName = document.name;
      const fileName = getDocumentFileName(monthNumber, docNumber);

      // Generate using LLM
      const result = await llmService.generateCompletion(systemPrompt, userPrompt, {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || document.estimatedTokens || 16000,
        provider: options.provider,
      });

      if (!result || !result.content) {
        throw new Error('LLM service returned empty content');
      }

      // Save to file system
      const monthDir = this.getMonthDirectory(clientData.id, monthNumber);
      await this.ensureDirectory(monthDir);

      const filePath = path.join(monthDir, fileName);
      await fs.writeFile(filePath, result.content, 'utf8');

      console.log(`[OnboardingKit] Document generated successfully: ${filePath}`);

      return {
        success: true,
        document: {
          name: documentName,
          fileName,
          filePath,
          content: result.content,
          monthNumber,
          docNumber,
          generatedAt: new Date(),
          tokensUsed: result.tokensUsed,
          provider: result.provider,
          model: result.model,
          status: 'generated',
          version: 1,
        },
      };
    } catch (error) {
      console.error(`[OnboardingKit] Error generating document:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate all documents for a specific month
   */
  async generateMonthDocuments(clientData, monthNumber, options = {}) {
    try {
      console.log(`[OnboardingKit] Generating all Month ${monthNumber} documents for ${clientData.name}`);

      const monthDocuments = [];
      const errors = [];

      // Get number of documents for this month (should be 5)
      const monthData = require('../utils/documentTemplates').getMonthDocuments(monthNumber);
      const docCount = monthData?.documents?.length || 5;

      // Generate each document sequentially (to avoid rate limits)
      for (let docNumber = 1; docNumber <= docCount; docNumber++) {
        const result = await this.generateDocument(clientData, monthNumber, docNumber, options);

        if (result.success) {
          monthDocuments.push(result.document);
        } else {
          errors.push({
            docNumber,
            error: result.error,
          });
        }

        // Small delay between generations to respect rate limits
        if (docNumber < docCount) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      return {
        success: errors.length === 0,
        documents: monthDocuments,
        errors: errors.length > 0 ? errors : undefined,
        generatedCount: monthDocuments.length,
        totalCount: docCount,
      };
    } catch (error) {
      console.error(`[OnboardingKit] Error generating month documents:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Read generated document from file system
   */
  async readDocument(clientId, monthNumber, docNumber) {
    try {
      const fileName = getDocumentFileName(monthNumber, docNumber);
      const filePath = path.join(this.getMonthDirectory(clientId, monthNumber), fileName);

      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);

      return {
        success: true,
        content,
        fileName,
        filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      console.error(`[OnboardingKit] Error reading document:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if document exists
   */
  async documentExists(clientId, monthNumber, docNumber) {
    try {
      const fileName = getDocumentFileName(monthNumber, docNumber);
      const filePath = path.join(this.getMonthDirectory(clientId, monthNumber), fileName);

      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(clientId, monthNumber, docNumber) {
    try {
      const fileName = getDocumentFileName(monthNumber, docNumber);
      const filePath = path.join(this.getMonthDirectory(clientId, monthNumber), fileName);

      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all documents for a client
   */
  async getClientDocuments(clientId) {
    try {
      const clientDir = this.getClientDirectory(clientId);
      const documents = [];

      for (let month = 1; month <= 8; month++) {
        const monthDir = path.join(clientDir, `month-${month}`);

        try {
          await fs.access(monthDir);
          const files = await fs.readdir(monthDir);

          for (const file of files) {
            if (file.endsWith('.md')) {
              const filePath = path.join(monthDir, file);
              const stats = await fs.stat(filePath);

              documents.push({
                month,
                fileName: file,
                filePath,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
              });
            }
          }
        } catch {
          // Month directory doesn't exist yet
          continue;
        }
      }

      return {
        success: true,
        documents,
        count: documents.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new OnboardingKitGenerator();
