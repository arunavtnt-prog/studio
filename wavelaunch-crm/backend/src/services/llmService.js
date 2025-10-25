const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Multi-Provider LLM Service
 *
 * Supports OpenAI, Claude (Anthropic), and Gemini (Google).
 * Switch providers via LLM_PROVIDER env variable.
 *
 * Providers:
 * - openai: GPT-4, GPT-3.5-turbo
 * - claude: Claude 3.5 Sonnet, Opus, Haiku
 * - gemini: Gemini 1.5 Pro, Flash
 *
 * Configuration via .env:
 * - LLM_PROVIDER=openai|claude|gemini (default: openai)
 * - LLM_MODEL=gpt-4-turbo-preview|claude-3-5-sonnet-20241022|gemini-1.5-pro-latest
 * - OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY
 */

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.model = process.env.LLM_MODEL;
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS) || 2000;

    // Initialize clients
    this.clients = {};
    this.initializeClients();
  }

  /**
   * Initialize API Clients
   */
  initializeClients() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.clients.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      if (!this.model && this.provider === 'openai') {
        this.model = 'gpt-4-turbo-preview';
      }
    }

    // Claude (Anthropic)
    if (process.env.ANTHROPIC_API_KEY) {
      this.clients.claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      if (!this.model && this.provider === 'claude') {
        this.model = 'claude-3-5-sonnet-20241022'; // Latest Claude model
      }
    }

    // Gemini (Google)
    if (process.env.GOOGLE_AI_API_KEY) {
      this.clients.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      if (!this.model && this.provider === 'gemini') {
        this.model = 'gemini-1.5-pro-latest';
      }
    }

    console.log(`✓ LLM Service initialized with provider: ${this.provider} (${this.model})`);

    if (!this.clients[this.provider]) {
      console.warn(`⚠ ${this.provider} client not initialized. Check API key in .env`);
    }
  }

  /**
   * Generate Completion (Unified Interface)
   *
   * @param {string} systemPrompt - System instructions
   * @param {string} userPrompt - User message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated result
   */
  async generateCompletion(systemPrompt, userPrompt, options = {}) {
    const provider = options.provider || this.provider;
    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || this.maxTokens;

    switch (provider) {
      case 'openai':
        return await this.generateWithOpenAI(systemPrompt, userPrompt, { model, temperature, maxTokens, ...options });

      case 'claude':
        return await this.generateWithClaude(systemPrompt, userPrompt, { model, temperature, maxTokens, ...options });

      case 'gemini':
        return await this.generateWithGemini(systemPrompt, userPrompt, { model, temperature, maxTokens, ...options });

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Generate with OpenAI
   */
  async generateWithOpenAI(systemPrompt, userPrompt, options = {}) {
    if (!this.clients.openai) {
      throw new Error('OpenAI client not initialized. Add OPENAI_API_KEY to .env');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const params = {
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 2000,
    };

    if (options.responseFormat === 'json') {
      params.response_format = { type: 'json_object' };
    }

    const response = await this.clients.openai.chat.completions.create(params);

    return {
      content: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      provider: 'openai',
      model: params.model,
    };
  }

  /**
   * Generate with Claude (Anthropic)
   */
  async generateWithClaude(systemPrompt, userPrompt, options = {}) {
    if (!this.clients.claude) {
      throw new Error('Claude client not initialized. Add ANTHROPIC_API_KEY to .env');
    }

    const params = {
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature ?? 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    };

    const response = await this.clients.claude.messages.create(params);

    return {
      content: response.content[0].text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      provider: 'claude',
      model: params.model,
    };
  }

  /**
   * Generate with Gemini (Google)
   */
  async generateWithGemini(systemPrompt, userPrompt, options = {}) {
    if (!this.clients.gemini) {
      throw new Error('Gemini client not initialized. Add GOOGLE_AI_API_KEY to .env');
    }

    const modelName = options.model || 'gemini-1.5-pro-latest';
    const model = this.clients.gemini.getGenerativeModel({ model: modelName });

    // Gemini doesn't have separate system prompt, so we prepend it
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const generationConfig = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens || 2000,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig,
    });

    const response = result.response;

    return {
      content: response.text(),
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      provider: 'gemini',
      model: modelName,
    };
  }

  /**
   * Analyze Lead Application
   *
   * Works with any provider. Automatically handles JSON formatting.
   */
  async analyzeLeadApplication(leadData, guidelines = null) {
    try {
      const systemPrompt = 'You are an expert creator analyst for Wavelaunch Studio, a premium creator business development agency. Always respond with valid JSON.';

      const userPrompt = `
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
  "sentiment": 0.75,
  "fitScore": 85,
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

      const result = await this.generateCompletion(systemPrompt, userPrompt, {
        responseFormat: 'json',
        temperature: 0.7,
      });

      // Parse JSON response
      let analysis;
      try {
        analysis = JSON.parse(result.content);
      } catch (e) {
        // Some providers might not perfectly format JSON, extract it
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse JSON response');
        }
      }

      return {
        success: true,
        analysis,
        tokensUsed: result.tokensUsed,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      console.error('Error analyzing lead application:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate Onboarding Kit
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

      const systemPrompt = 'You are a professional onboarding specialist creating welcoming and clear documentation.';

      const userPrompt = `
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

      const result = await this.generateCompletion(systemPrompt, userPrompt, {
        temperature: 0.8,
      });

      return {
        success: true,
        content: result.content,
        tokensUsed: result.tokensUsed,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      console.error('Error generating onboarding kit:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate Monthly Deliverable Document
   */
  async generateMonthlyDeliverable(clientData, month, context = {}, template = null) {
    try {
      const systemPrompt = 'You are a business strategist creating detailed deliverable reports.';

      const userPrompt = `
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

      const result = await this.generateCompletion(systemPrompt, userPrompt, {
        temperature: 0.7,
      });

      return {
        success: true,
        content: result.content,
        month,
        tokensUsed: result.tokensUsed,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      console.error('Error generating monthly deliverable:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze Email Sentiment
   */
  async analyzeEmailSentiment(emailBody, subject = '') {
    try {
      const systemPrompt = 'You are an email analysis expert. Always respond with valid JSON.';

      const userPrompt = `
Analyze the sentiment and key information from this email:

**Subject:** ${subject}

**Body:**
${emailBody.substring(0, 2000)} ${emailBody.length > 2000 ? '...' : ''}

Provide a JSON response:
{
  "sentiment": 0.75,
  "sentimentLabel": "Positive",
  "urgency": "Medium",
  "keyTopics": ["topic1", "topic2"],
  "requiresAction": false,
  "category": "General"
}
`;

      const result = await this.generateCompletion(systemPrompt, userPrompt, {
        responseFormat: 'json',
        temperature: 0.3,
        maxTokens: 500,
      });

      // Parse JSON
      let analysis;
      try {
        analysis = JSON.parse(result.content);
      } catch (e) {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse JSON response');
        }
      }

      return {
        success: true,
        analysis,
        tokensUsed: result.tokensUsed,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      console.error('Error analyzing email sentiment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Summarize Content
   */
  async summarizeContent(content, maxLength = 100) {
    try {
      const systemPrompt = `You are a summarization expert. Create concise summaries in ${maxLength} words or less.`;
      const userPrompt = `Summarize the following:\n\n${content.substring(0, 3000)}`;

      const result = await this.generateCompletion(systemPrompt, userPrompt, {
        temperature: 0.5,
        maxTokens: Math.ceil(maxLength * 1.5),
      });

      return {
        success: true,
        summary: result.content,
        tokensUsed: result.tokensUsed,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      console.error('Error summarizing content:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Provider Info
   */
  getProviderInfo() {
    return {
      currentProvider: this.provider,
      currentModel: this.model,
      availableProviders: Object.keys(this.clients),
      maxTokens: this.maxTokens,
    };
  }
}

module.exports = new LLMService();
