const OpenAI = require('openai');
require('dotenv').config();

/**
 * LLM Service
 *
 * Handles all AI/LLM operations for the CRM:
 * - Lead application analysis and scoring
 * - Document generation (onboarding kits, monthly deliverables)
 * - Email sentiment analysis
 * - Content summarization
 *
 * CUSTOMIZATION POINTS:
 * - Modify prompts in each function to match your brand voice
 * - Adjust temperature and max_tokens for different use cases
 * - Add custom guidelines via the guidelines parameter
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LLMService = {
  /**
   * Analyze Lead Application
   *
   * Takes a lead's application data and performs:
   * 1. Comprehensive summary
   * 2. Sentiment analysis
   * 3. Fit scoring (0-100)
   * 4. Recommendations
   *
   * @param {Object} leadData - Lead application data
   * @param {string} leadData.name - Applicant name
   * @param {string} leadData.niche - Content niche
   * @param {Object} leadData.followers - Follower counts
   * @param {Object} leadData.engagement - Engagement metrics
   * @param {string} leadData.summary - Applicant's summary
   * @param {Object} leadData.customFormAnswers - Custom question answers
   * @param {string} guidelines - Optional custom guidelines for analysis
   * @returns {Promise<Object>} Analysis results
   *
   * TODO: Customize the analysis prompt with your specific criteria
   * TODO: Add industry-specific scoring factors
   * TODO: Integrate with your brand guidelines
   */
  async analyzeLeadApplication(leadData, guidelines = null) {
    try {
      const prompt = `
You are an expert creator analyst for Wavelaunch Studio, a premium creator business development agency.

Analyze the following creator application and provide detailed insights:

**Applicant Information:**
- Name: ${leadData.name}
- Niche: ${leadData.niche}
- Total Followers: ${leadData.followers?.total || 0}
- Engagement Rate: ${leadData.engagement?.rate || 0}%
- Summary: ${leadData.summary}

**Custom Answers:**
${JSON.stringify(leadData.customFormAnswers, null, 2)}

${guidelines ? `\n**Custom Guidelines:**\n${guidelines}\n` : ''}

Provide a JSON response with the following structure:
{
  "summary": "A concise 2-3 sentence summary of this creator",
  "sentiment": 0.75,  // 0-1 scale: how positive/enthusiastic is the application
  "fitScore": 85,     // 0-100: how well they fit our program
  "strengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendations": "What we should do next with this lead",
  "keyInsights": ["insight1", "insight2"],
  "estimatedRevenuePotential": "High/Medium/Low",
  "reasoning": "Detailed explanation of the fit score"
}

Focus on:
- Audience size and engagement quality
- Niche market potential
- Creator's commitment and professionalism
- Growth potential
- Alignment with Wavelaunch Studio's premium positioning
`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert creator analyst. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        analysis,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error analyzing lead application:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Generate Onboarding Kit
   *
   * Creates a personalized onboarding document for a newly onboarded client.
   * Uses client profile data and optional templates/guidelines.
   *
   * @param {Object} clientData - Client profile data
   * @param {string} template - Optional template/guidelines
   * @returns {Promise<Object>} Generated document content
   *
   * TODO: Add your onboarding kit template in the prompt or via template parameter
   * TODO: Customize sections based on your onboarding process
   * TODO: Add company-specific resources and links
   */
  async generateOnboardingKit(clientData, template = null) {
    try {
      const defaultTemplate = `
# Welcome to Wavelaunch Studio!

We're thrilled to have you join our creator community. This kit will guide you through your journey with us.

## What to Include:
1. Welcome message
2. Next steps timeline
3. Key contacts and communication channels
4. Required documents/information
5. First week action items
6. FAQ section
7. Resources and tools
`;

      const prompt = `
Create a personalized onboarding kit for a new client at Wavelaunch Studio.

**Client Information:**
- Name: ${clientData.name}
- Niche: ${clientData.profileData?.niche || 'Not specified'}
- Journey Stage: ${clientData.journeyStage}
- Current Project: ${clientData.currentProject?.name || 'Not yet defined'}

${template ? `\n**Template to Follow:**\n${template}\n` : `\n**Default Structure:**\n${defaultTemplate}\n`}

Generate a warm, professional, and comprehensive onboarding document in Markdown format.
Make it personal and specific to ${clientData.name}.

Include:
- Personalized welcome
- Clear action items for the first 30 days
- Contact information for their account manager
- Links to key resources (use placeholders like [Resource Name](URL))
- Timeline expectations for their journey stage
`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional onboarding specialist creating welcoming and clear documentation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
      });

      const content = response.choices[0].message.content;

      return {
        success: true,
        content,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error generating onboarding kit:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Generate Monthly Deliverable Document
   *
   * Creates month-specific deliverables based on client progress and stage.
   * Highly customizable with prompts and templates.
   *
   * @param {Object} clientData - Client profile
   * @param {string} month - Target month (e.g., "January 2024")
   * @param {Object} context - Additional context (milestones, metrics, etc.)
   * @param {string} template - Custom template/guidelines
   * @returns {Promise<Object>} Generated document
   *
   * TODO: Define your monthly deliverable structure
   * TODO: Add metrics and KPIs specific to each journey stage
   * TODO: Customize based on client's niche and project type
   */
  async generateMonthlyDeliverable(clientData, month, context = {}, template = null) {
    try {
      const prompt = `
Generate a monthly deliverable document for a Wavelaunch Studio client.

**Client:** ${clientData.name}
**Month:** ${month}
**Journey Stage:** ${clientData.journeyStage}
**Current Project:** ${clientData.currentProject?.name || 'General Development'}
**Progress:** ${clientData.journeyProgress}%

**Recent Context:**
${JSON.stringify(context, null, 2)}

${template ? `\n**Custom Template:**\n${template}\n` : ''}

Create a comprehensive monthly deliverable document that includes:

1. **Executive Summary** - Month overview and key achievements
2. **Completed Milestones** - What was accomplished
3. **Metrics & KPIs** - Relevant performance indicators
4. **Next Month Goals** - Clear objectives for the coming month
5. **Action Items** - Specific tasks for the client
6. **Resources Provided** - Links, templates, guides shared this month
7. **Strategic Recommendations** - Expert advice for their growth

Format in clean Markdown. Be specific and actionable.
`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a business strategist creating detailed deliverable reports.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
      });

      const content = response.choices[0].message.content;

      return {
        success: true,
        content,
        month,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error generating monthly deliverable:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Analyze Email Sentiment
   *
   * Extracts sentiment, urgency, and key topics from email content.
   *
   * @param {string} emailBody - Email content
   * @param {string} subject - Email subject
   * @returns {Promise<Object>} Sentiment analysis results
   */
  async analyzeEmailSentiment(emailBody, subject = '') {
    try {
      const prompt = `
Analyze the sentiment and key information from this email:

**Subject:** ${subject}

**Body:**
${emailBody.substring(0, 2000)} ${emailBody.length > 2000 ? '...' : ''}

Provide a JSON response:
{
  "sentiment": 0.75,  // 0=very negative, 0.5=neutral, 1=very positive
  "sentimentLabel": "Positive",  // Positive, Neutral, or Negative
  "urgency": "Medium",  // Low, Medium, High
  "keyTopics": ["topic1", "topic2"],
  "requiresAction": false,  // Does this need a response or action?
  "category": "General"  // General, Support, Milestone, Contract, Financial, Other
}
`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an email analysis expert. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        analysis,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error analyzing email sentiment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Summarize Content
   *
   * Generic function to summarize any text content.
   *
   * @param {string} content - Content to summarize
   * @param {number} maxLength - Maximum summary length in words
   * @returns {Promise<Object>} Summary
   */
  async summarizeContent(content, maxLength = 100) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a summarization expert. Create concise summaries in ${maxLength} words or less.`,
          },
          {
            role: 'user',
            content: `Summarize the following:\n\n${content.substring(0, 3000)}`,
          },
        ],
        temperature: 0.5,
        max_tokens: Math.ceil(maxLength * 1.5),
      });

      return {
        success: true,
        summary: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error summarizing content:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

module.exports = LLMService;
