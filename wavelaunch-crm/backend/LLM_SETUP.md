# Multi-Provider LLM Setup Guide

The Wavelaunch CRM now supports **three AI providers** for document generation and analysis:
- **OpenAI** (GPT-4, GPT-3.5 Turbo)
- **Claude** by Anthropic (Claude 3.5 Sonnet, Opus, Haiku)
- **Gemini** by Google (Gemini 1.5 Pro, Flash)

This guide explains how to set up and switch between providers.

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Claude/Anthropic SDK
- `@google/generative-ai` - Gemini/Google AI SDK

### 2. Get API Keys

Choose one or more providers and get your API keys:

| Provider | Get API Key | Documentation |
|----------|-------------|---------------|
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | [OpenAI Docs](https://platform.openai.com/docs) |
| **Claude** | [console.anthropic.com](https://console.anthropic.com/) | [Anthropic Docs](https://docs.anthropic.com/) |
| **Gemini** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | [Google AI Docs](https://ai.google.dev/) |

### 3. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
# Choose your provider
LLM_PROVIDER=openai

# Add API key(s) for provider(s) you want to use
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AI...
```

---

## Provider Configuration

### Option 1: OpenAI (GPT-4)

**Best for**: General purpose, JSON formatting, function calling

```bash
# .env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
LLM_MODEL=gpt-4-turbo-preview
LLM_MAX_TOKENS=2000
```

**Available Models**:
- `gpt-4-turbo-preview` - Most capable, best for complex analysis
- `gpt-4` - Stable GPT-4 model
- `gpt-3.5-turbo` - Faster, cheaper, good for simple tasks

**Pricing** (as of Jan 2025):
- GPT-4 Turbo: $0.01/1K input tokens, $0.03/1K output tokens
- GPT-3.5 Turbo: $0.0005/1K input tokens, $0.0015/1K output tokens

---

### Option 2: Claude (Anthropic)

**Best for**: Long context, nuanced writing, safety

```bash
# .env
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your_key_here
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_MAX_TOKENS=2000
```

**Available Models**:
- `claude-3-5-sonnet-20241022` - **Recommended** - Latest, most capable
- `claude-3-opus-20240229` - Most powerful, highest cost
- `claude-3-haiku-20240307` - Fastest, lowest cost

**Pricing**:
- Claude 3.5 Sonnet: $0.003/1K input tokens, $0.015/1K output tokens
- Claude 3 Opus: $0.015/1K input tokens, $0.075/1K output tokens
- Claude 3 Haiku: $0.00025/1K input tokens, $0.00125/1K output tokens

---

### Option 3: Gemini (Google)

**Best for**: Multimodal tasks, cost-effective, Google ecosystem

```bash
# .env
LLM_PROVIDER=gemini
GOOGLE_AI_API_KEY=AIza...your_key_here
LLM_MODEL=gemini-1.5-pro-latest
LLM_MAX_TOKENS=2000
```

**Available Models**:
- `gemini-1.5-pro-latest` - Most capable, large context window (2M tokens)
- `gemini-1.5-flash-latest` - Faster, cheaper alternative

**Pricing**:
- Gemini 1.5 Pro: $0.00125/1K input tokens, $0.005/1K output tokens (up to 128K context)
- Gemini 1.5 Flash: $0.000075/1K input tokens, $0.0003/1K output tokens

**Note**: Gemini has generous free tier limits for development.

---

## Switching Providers

You can switch providers at any time by changing the `LLM_PROVIDER` environment variable:

```bash
# Use OpenAI
LLM_PROVIDER=openai

# Use Claude
LLM_PROVIDER=claude

# Use Gemini
LLM_PROVIDER=gemini
```

Restart your server after changing:

```bash
npm run dev
```

You'll see a confirmation:
```
✓ LLM Service initialized with provider: claude (claude-3-5-sonnet-20241022)
```

---

## Advanced Configuration

### Per-Request Provider Override

You can override the provider for specific requests using API parameters:

```javascript
// Example: Use Claude for this specific analysis
const result = await llmService.generateCompletion(
  systemPrompt,
  userPrompt,
  {
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
  }
);
```

### Temperature Settings

Control creativity vs. consistency:

```bash
# In generateCompletion() options
temperature: 0.3  # More deterministic, factual
temperature: 0.7  # Balanced (default)
temperature: 0.9  # More creative, varied
```

### Max Tokens

Control response length:

```bash
LLM_MAX_TOKENS=2000  # Default
LLM_MAX_TOKENS=4000  # Longer responses
LLM_MAX_TOKENS=1000  # Shorter, cheaper
```

---

## Features by Provider

All providers support these CRM functions:

| Function | OpenAI | Claude | Gemini |
|----------|--------|--------|--------|
| Lead Analysis | ✅ | ✅ | ✅ |
| Onboarding Kit Generation | ✅ | ✅ | ✅ |
| Monthly Deliverables | ✅ | ✅ | ✅ |
| Email Sentiment Analysis | ✅ | ✅ | ✅ |
| Content Summarization | ✅ | ✅ | ✅ |
| JSON Response Formatting | ✅ Best | ✅ Good | ✅ Good |

**Recommendations**:
- **OpenAI GPT-4**: Best for structured JSON output (lead analysis, email sentiment)
- **Claude 3.5 Sonnet**: Best for long-form content (onboarding kits, monthly deliverables)
- **Gemini 1.5 Pro**: Best for cost-effective operations at scale

---

## Testing Your Setup

### 1. Check Provider Info

Add this endpoint to test your configuration (already included in the code):

```bash
curl http://localhost:5000/api/v1/llm/info
```

Response:
```json
{
  "currentProvider": "claude",
  "currentModel": "claude-3-5-sonnet-20241022",
  "availableProviders": ["openai", "claude", "gemini"],
  "maxTokens": 2000
}
```

### 2. Test Lead Analysis

Create a test lead and trigger AI analysis:

```bash
POST http://localhost:5000/api/v1/leads
{
  "name": "Test Creator",
  "email": "test@example.com",
  "niche": "Tech Education",
  "followers": { "total": 50000 },
  "engagement": { "rate": 3.5 }
}
```

Check the response for `aiAnalysis` field - it should contain analysis from your configured provider.

---

## Troubleshooting

### Error: "OpenAI client not initialized"

**Cause**: Missing or invalid `OPENAI_API_KEY`

**Fix**:
1. Check `.env` file has the key
2. Verify key starts with `sk-`
3. Test key at [platform.openai.com](https://platform.openai.com/)
4. Restart server

### Error: "Claude client not initialized"

**Cause**: Missing or invalid `ANTHROPIC_API_KEY`

**Fix**:
1. Check `.env` file has the key
2. Verify key starts with `sk-ant-`
3. Get new key from [console.anthropic.com](https://console.anthropic.com/)
4. Restart server

### Error: "Gemini client not initialized"

**Cause**: Missing or invalid `GOOGLE_AI_API_KEY`

**Fix**:
1. Check `.env` file has the key
2. Verify key starts with `AIza`
3. Get new key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
4. Restart server

### Error: "Failed to parse JSON response"

**Cause**: Some providers may not perfectly format JSON on first try

**Fix**: The service automatically retries with regex extraction. If this persists:
1. Lower `temperature` to 0.3 for more consistent output
2. Switch to OpenAI for JSON-heavy tasks (lead analysis, email sentiment)

### Rate Limit Errors

**OpenAI**: Default limits vary by tier. Upgrade at [platform.openai.com/account/limits](https://platform.openai.com/account/limits)

**Claude**: Contact sales for higher limits at [anthropic.com](https://www.anthropic.com/contact-sales)

**Gemini**: Free tier is generous. Upgrade at [ai.google.dev/pricing](https://ai.google.dev/pricing)

---

## Cost Optimization Tips

1. **Use the right tool for the job**:
   - Simple tasks (summaries): Use Gemini Flash or GPT-3.5
   - Complex analysis: Use GPT-4 or Claude Sonnet
   - Long documents: Use Claude Sonnet or Gemini Pro

2. **Reduce max_tokens**: Set `LLM_MAX_TOKENS` to the minimum needed

3. **Cache results**: The system caches lead analysis to avoid re-analyzing

4. **Batch operations**: Process multiple leads in one request when possible

5. **Monitor usage**:
   - OpenAI: [platform.openai.com/usage](https://platform.openai.com/usage)
   - Claude: [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)
   - Gemini: [aistudio.google.com](https://aistudio.google.com)

---

## Security Best Practices

1. **Never commit API keys**: Use `.env` file (already in `.gitignore`)

2. **Rotate keys periodically**: Update keys every 90 days

3. **Use environment-specific keys**:
   - Development: Test keys with lower limits
   - Production: Production keys with monitoring

4. **Monitor for abuse**: Set up billing alerts in each provider's console

5. **Restrict API key permissions**: Use read-only keys where possible

---

## Getting Help

- **OpenAI**: [help.openai.com](https://help.openai.com/)
- **Claude**: [support.anthropic.com](https://support.anthropic.com/)
- **Gemini**: [support.google.com](https://support.google.com/)

For CRM-specific issues, check the main README.md or contact your development team.
