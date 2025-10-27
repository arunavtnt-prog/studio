/**
 * Business Plan Parser Service
 *
 * Uses AI to extract key information from uploaded business plans (PDF/DOCX)
 * and populate client brandInfo, marketPosition, revenueGoals, etc.
 */

const llmService = require('./llmService');
const fs = require('fs').promises;
const path = require('path');

class BusinessPlanParser {
  /**
   * Parse business plan document and extract structured data
   */
  async parseBusinessPlan(filePath, fileName) {
    try {
      console.log(`[BusinessPlanParser] Parsing: ${fileName}`);

      // Extract text from file
      const text = await this.extractTextFromFile(filePath, fileName);

      if (!text || text.length < 100) {
        throw new Error('Business plan is too short or could not be extracted');
      }

      // Use LLM to parse and structure the data
      const parsedData = await this.parseWithAI(text);

      console.log(`[BusinessPlanParser] Successfully parsed ${fileName}`);
      return {
        success: true,
        parsedData,
        extractedTextLength: text.length,
      };
    } catch (error) {
      console.error('[BusinessPlanParser] Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract text from uploaded file
   * For MVP, we'll read plain text. In production, add PDF/DOCX parsing libraries.
   */
  async extractTextFromFile(filePath, fileName) {
    try {
      const ext = path.extname(fileName).toLowerCase();

      // For now, handle text files and simple extraction
      // TODO: Add pdf-parse for PDF files and mammoth for DOCX files
      if (ext === '.txt' || ext === '.md') {
        return await fs.readFile(filePath, 'utf8');
      }

      // For PDF/DOCX, return placeholder for now
      // In production, use:
      // - pdf-parse for PDF extraction
      // - mammoth for DOCX extraction
      console.warn(`[BusinessPlanParser] File type ${ext} not yet supported. Using placeholder.`);
      return `Business plan uploaded: ${fileName}. Full parsing coming soon.`;
    } catch (error) {
      console.error('[BusinessPlanParser] File extraction error:', error);
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Use AI to parse business plan text into structured data
   */
  async parseWithAI(businessPlanText) {
    try {
      const systemPrompt = `You are a business plan analyzer. Extract key information from business plans and return structured JSON data. Be precise and only extract information that is explicitly stated. Use null for missing information.`;

      const userPrompt = `
Analyze this business plan and extract key information. Return ONLY valid JSON in the exact format specified below.

BUSINESS PLAN TEXT:
${businessPlanText.substring(0, 15000)} ${businessPlanText.length > 15000 ? '...(truncated)' : ''}

Return JSON in this EXACT structure (use null for missing info):

{
  "productType": "string (e.g., Physical Product, Digital Course, Subscription Box, Software, Service)",
  "targetRevenue": {
    "softLaunch": number (in dollars, no commas),
    "fullLaunch": number,
    "year1": number
  },
  "targetAudience": {
    "demographics": "string (age, gender, income, location)",
    "psychographics": "string (values, interests, behaviors)",
    "painPoints": ["string", "string", "string"]
  },
  "valueProposition": "string (unique selling proposition)",
  "competitors": [
    { "name": "string", "strength": "string" },
    { "name": "string", "strength": "string" }
  ],
  "differentiators": ["string", "string", "string"],
  "platforms": ["string (social media/distribution channels)"],
  "launchTimeline": {
    "softLaunchDate": "YYYY-MM-DD or null",
    "fullLaunchDate": "YYYY-MM-DD or null",
    "onboardingStartDate": "YYYY-MM-DD or null"
  },
  "niche": "string (industry/category)",
  "skus": ["string (product names or SKUs)"],
  "pricePoints": {
    "low": number or null,
    "mid": number or null,
    "high": number or null
  },
  "ecommercePlatform": "string (Shopify, WooCommerce, etc.) or null",
  "emailProvider": "string (Klaviyo, ConvertKit, etc.) or null",
  "emailListSize": number or null,
  "totalFollowers": number or null,
  "engagementRate": number (percentage) or null
}

IMPORTANT: Return ONLY the JSON object, no additional text or explanation.
`;

      const result = await llmService.generateCompletion(systemPrompt, userPrompt, {
        temperature: 0.3, // Lower temperature for more consistent extraction
        maxTokens: 2000,
      });

      if (!result || !result.content) {
        throw new Error('LLM returned empty response');
      }

      // Parse JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(result.content);
      } catch (e) {
        // Try to extract JSON from response if it's wrapped in text
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse JSON from LLM response');
        }
      }

      // Validate and clean the parsed data
      const cleanedData = this.validateAndCleanParsedData(parsedData);

      return cleanedData;
    } catch (error) {
      console.error('[BusinessPlanParser] AI parsing error:', error);
      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  /**
   * Validate and clean parsed data
   */
  validateAndCleanParsedData(data) {
    const cleaned = {
      productType: data.productType || null,
      targetRevenue: {
        softLaunch: this.parseNumber(data.targetRevenue?.softLaunch),
        fullLaunch: this.parseNumber(data.targetRevenue?.fullLaunch),
        year1: this.parseNumber(data.targetRevenue?.year1),
      },
      targetAudience: {
        demographics: data.targetAudience?.demographics || null,
        psychographics: data.targetAudience?.psychographics || null,
        painPoints: Array.isArray(data.targetAudience?.painPoints)
          ? data.targetAudience.painPoints.filter(Boolean)
          : [],
      },
      valueProposition: data.valueProposition || null,
      competitors: Array.isArray(data.competitors)
        ? data.competitors.filter((c) => c && c.name).map((c) => ({
            name: c.name,
            strength: c.strength || '',
          }))
        : [],
      differentiators: Array.isArray(data.differentiators) ? data.differentiators.filter(Boolean) : [],
      platforms: Array.isArray(data.platforms) ? data.platforms.filter(Boolean) : [],
      launchTimeline: {
        softLaunchDate: this.parseDate(data.launchTimeline?.softLaunchDate),
        fullLaunchDate: this.parseDate(data.launchTimeline?.fullLaunchDate),
        onboardingStartDate: this.parseDate(data.launchTimeline?.onboardingStartDate),
      },
      niche: data.niche || null,
      skus: Array.isArray(data.skus) ? data.skus.filter(Boolean) : [],
      pricePoints: {
        low: this.parseNumber(data.pricePoints?.low),
        mid: this.parseNumber(data.pricePoints?.mid),
        high: this.parseNumber(data.pricePoints?.high),
      },
      ecommercePlatform: data.ecommercePlatform || null,
      emailProvider: data.emailProvider || null,
      emailListSize: this.parseNumber(data.emailListSize),
      totalFollowers: this.parseNumber(data.totalFollowers),
      engagementRate: this.parseNumber(data.engagementRate),
    };

    return cleaned;
  }

  /**
   * Helper: Parse number safely
   */
  parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Helper: Parse date safely
   */
  parseDate(value) {
    if (!value) return null;
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Apply parsed data to client record
   */
  applyParsedDataToClient(client, parsedData) {
    const updates = {};

    // Update brandInfo
    if (!client.brandInfo) client.brandInfo = {};
    if (parsedData.niche) client.brandInfo.niche = parsedData.niche;
    if (parsedData.productType) client.brandInfo.productType = parsedData.productType;
    if (parsedData.valueProposition) client.brandInfo.valueProposition = parsedData.valueProposition;
    if (parsedData.skus && parsedData.skus.length > 0) client.brandInfo.skus = parsedData.skus;
    if (parsedData.pricePoints && (parsedData.pricePoints.low || parsedData.pricePoints.mid || parsedData.pricePoints.high)) {
      client.brandInfo.pricePoints = parsedData.pricePoints;
    }
    if (parsedData.targetAudience && (parsedData.targetAudience.demographics || parsedData.targetAudience.painPoints?.length > 0)) {
      client.brandInfo.targetAudience = parsedData.targetAudience;
    }

    updates.brandInfo = client.brandInfo;

    // Update marketPosition
    if (!client.marketPosition) client.marketPosition = {};
    if (parsedData.competitors && parsedData.competitors.length > 0) client.marketPosition.competitors = parsedData.competitors;
    if (parsedData.differentiators && parsedData.differentiators.length > 0) client.marketPosition.differentiators = parsedData.differentiators;
    updates.marketPosition = client.marketPosition;

    // Update revenueGoals
    if (!client.revenueGoals) client.revenueGoals = {};
    if (parsedData.targetRevenue?.softLaunch) client.revenueGoals.softLaunchTarget = parsedData.targetRevenue.softLaunch;
    if (parsedData.targetRevenue?.fullLaunch) client.revenueGoals.fullLaunchTarget = parsedData.targetRevenue.fullLaunch;
    if (parsedData.targetRevenue?.year1) client.revenueGoals.year1Revenue = parsedData.targetRevenue.year1;
    updates.revenueGoals = client.revenueGoals;

    // Update launchTimeline
    if (!client.launchTimeline) client.launchTimeline = {};
    if (parsedData.launchTimeline?.softLaunchDate) client.launchTimeline.softLaunchDate = parsedData.launchTimeline.softLaunchDate;
    if (parsedData.launchTimeline?.fullLaunchDate) client.launchTimeline.fullLaunchDate = parsedData.launchTimeline.fullLaunchDate;
    if (parsedData.launchTimeline?.onboardingStartDate) client.launchTimeline.onboardingStartDate = parsedData.launchTimeline.onboardingStartDate;
    updates.launchTimeline = client.launchTimeline;

    // Update contentAssets
    if (!client.contentAssets) client.contentAssets = {};
    if (parsedData.platforms && parsedData.platforms.length > 0) client.contentAssets.platforms = parsedData.platforms;
    updates.contentAssets = client.contentAssets;

    // Update communityMetrics
    if (!client.communityMetrics) client.communityMetrics = {};
    if (parsedData.emailListSize) client.communityMetrics.emailListSize = parsedData.emailListSize;
    if (parsedData.engagementRate) client.communityMetrics.engagementRate = parsedData.engagementRate;
    updates.communityMetrics = client.communityMetrics;

    // Update techStack
    if (!client.techStack) client.techStack = {};
    if (parsedData.ecommercePlatform) client.techStack.ecommercePlatform = parsedData.ecommercePlatform;
    if (parsedData.emailProvider) client.techStack.emailProvider = parsedData.emailProvider;
    updates.techStack = client.techStack;

    // Update socials if totalFollowers found
    if (parsedData.totalFollowers) {
      if (!client.socials) client.socials = {};
      client.socials.totalFollowers = parsedData.totalFollowers;
      updates.socials = client.socials;
    }

    return updates;
  }
}

module.exports = new BusinessPlanParser();
