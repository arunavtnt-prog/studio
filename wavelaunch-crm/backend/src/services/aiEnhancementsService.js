const llmService = require('./llmService');

/**
 * AI Enhancements Service
 *
 * Provides AI-powered enhancements for documents including:
 * - Automatic summarization
 * - Quality checks
 * - Revision suggestions
 * - Alternative version generation
 */
class AIEnhancementsService {
  /**
   * Generate a concise summary of a document
   */
  async summarizeDocument(markdownContent, documentName) {
    const prompt = `
      Summarize this document concisely for a busy executive.

      Document: ${documentName}

      Content:
      ${markdownContent.substring(0, 15000)} ${markdownContent.length > 15000 ? '...(truncated)' : ''}

      Provide:
      1. One-sentence summary (max 25 words)
      2. 3-5 key takeaways (bullet points)
      3. Critical action items (what must be done)

      Format as JSON:
      {
        "summary": "string",
        "keyTakeaways": ["string", "string", "string"],
        "actionItems": ["string", "string"]
      }
    `;

    try {
      const systemPrompt = 'You are an expert business consultant who creates concise executive summaries.';
      const result = await llmService.generateCompletion(systemPrompt, prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      });

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        data: parsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.error('Error summarizing document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Perform a quality check on a document
   */
  async qualityCheck(markdownContent, documentName) {
    const prompt = `
      Perform a comprehensive quality check on this document.

      Document: ${documentName}

      Content:
      ${markdownContent.substring(0, 15000)} ${markdownContent.length > 15000 ? '...(truncated)' : ''}

      Evaluate these criteria (1-10 scale):
      1. **Clarity**: Is the content clear and easy to understand?
      2. **Completeness**: Are all required sections present and thorough?
      3. **Actionability**: Are recommendations specific and actionable?
      4. **Consistency**: Is tone, formatting, and terminology consistent?
      5. **Accuracy**: Are there any factual errors or inconsistencies?

      For each criterion, provide:
      - Score (1-10)
      - Specific issues found (if any)

      Also provide:
      - Overall score (1-10)
      - Recommendation: "approve", "needs-minor-revisions", or "needs-major-revisions"

      Format as JSON:
      {
        "overallScore": number,
        "criteria": {
          "clarity": {
            "score": number,
            "issues": ["string"]
          },
          "completeness": {
            "score": number,
            "issues": ["string"]
          },
          "actionability": {
            "score": number,
            "issues": ["string"]
          },
          "consistency": {
            "score": number,
            "issues": ["string"]
          },
          "accuracy": {
            "score": number,
            "issues": ["string"]
          }
        },
        "recommendation": "approve|needs-minor-revisions|needs-major-revisions",
        "overallFeedback": "string"
      }
    `;

    try {
      const systemPrompt = 'You are a meticulous quality assurance expert who evaluates business documents.';
      const result = await llmService.generateCompletion(systemPrompt, prompt, {
        temperature: 0.2,
        maxTokens: 1500,
      });

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        data: parsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.error('Error performing quality check:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Suggest specific revisions based on client feedback
   */
  async suggestRevisions(markdownContent, documentName, revisionNotes) {
    const prompt = `
      A client requested revisions to this document. Analyze the revision notes and suggest specific changes.

      Document: ${documentName}

      Original Content:
      ${markdownContent.substring(0, 10000)} ${markdownContent.length > 10000 ? '...(truncated)' : ''}

      Revision Request:
      "${revisionNotes}"

      Provide specific recommendations:
      1. Which sections need changes
      2. What changes to make
      3. Additional improvements to consider

      Format as JSON:
      {
        "sectionsToChange": [
          {
            "section": "string (section title)",
            "currentIssue": "string",
            "recommendedChange": "string",
            "priority": "high|medium|low"
          }
        ],
        "additionalSuggestions": ["string", "string"],
        "estimatedRevisionTime": "string (e.g., '30 minutes', '2 hours')"
      }
    `;

    try {
      const systemPrompt = 'You are an expert editor who provides actionable revision guidance.';
      const result = await llmService.generateCompletion(systemPrompt, prompt, {
        temperature: 0.4,
        maxTokens: 1500,
      });

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        data: parsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.error('Error suggesting revisions:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate alternative versions with different tones
   */
  async generateAlternativeVersions(markdownContent, documentName, section = null) {
    const contentToRewrite = section || markdownContent.substring(0, 3000);

    const prompt = `
      Generate 3 alternative versions of this content with different tones.

      Original Content:
      ${contentToRewrite}

      Generate alternatives:
      1. More formal/professional tone
      2. More casual/conversational tone
      3. More data-driven/analytical tone

      Keep the same information but adjust the presentation style.

      Format as JSON:
      {
        "versions": [
          {
            "tone": "formal",
            "content": "string"
          },
          {
            "tone": "casual",
            "content": "string"
          },
          {
            "tone": "analytical",
            "content": "string"
          }
        ]
      }
    `;

    try {
      const systemPrompt = 'You are a skilled writer who can adapt content to different tones and audiences.';
      const result = await llmService.generateCompletion(systemPrompt, prompt, {
        temperature: 0.7,
        maxTokens: 3000,
      });

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        data: parsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.error('Error generating alternative versions:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract key metrics and numbers from a document
   */
  async extractKeyMetrics(markdownContent) {
    const prompt = `
      Extract all important metrics, numbers, and KPIs from this document.

      Content:
      ${markdownContent.substring(0, 10000)}

      Return as JSON:
      {
        "metrics": [
          {
            "name": "string",
            "value": "string",
            "category": "financial|growth|engagement|operational"
          }
        ]
      }
    `;

    try {
      const systemPrompt = 'You are a data analyst who extracts key metrics from business documents.';
      const result = await llmService.generateCompletion(systemPrompt, prompt, {
        temperature: 0.1,
        maxTokens: 1000,
      });

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        data: parsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.error('Error extracting metrics:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AIEnhancementsService();
