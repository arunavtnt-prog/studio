# AI Document Generation Setup Guide

Complete guide for configuring AI-powered document generation in Wavelaunch CRM.

## Overview

The Wavelaunch CRM uses AI to automatically generate onboarding documents, analyze leads, and provide intelligent insights. The system supports three LLM providers:

- **OpenAI** (GPT-4, GPT-3.5-turbo) - Default
- **Claude** (Anthropic) - Claude 3.5 Sonnet, Opus, Haiku
- **Gemini** (Google) - Gemini 1.5 Pro, Flash

## Quick Start

### Option 1: OpenAI (Recommended)

1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   LLM_PROVIDER=openai
   LLM_MODEL=gpt-4-turbo-preview
   ```

### Option 2: Claude (Anthropic)

1. Get API key from https://console.anthropic.com/
2. Add to `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   LLM_PROVIDER=claude
   LLM_MODEL=claude-3-5-sonnet-20241022
   ```

### Option 3: Gemini (Google)

1. Get API key from https://aistudio.google.com/app/apikey
2. Add to `.env`:
   ```bash
   GOOGLE_AI_API_KEY=your-key-here
   LLM_PROVIDER=gemini
   LLM_MODEL=gemini-1.5-pro-latest
   ```

## Detailed Configuration

### Environment Variables

Add these to `/home/user/studio/wavelaunch-crm/backend/.env`:

```bash
# LLM Configuration
LLM_PROVIDER=openai  # or claude, gemini
LLM_MAX_TOKENS=2000  # Max tokens per request
LLM_MODEL=gpt-4-turbo-preview  # Model to use

# Provider-Specific Keys (add the one you're using)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GOOGLE_AI_API_KEY=your-google-key-here
```

### Provider Comparison

| Provider | Pros | Cons | Cost | Speed |
|----------|------|------|------|-------|
| **OpenAI** | Most reliable, best quality | Most expensive | $$$$ | Fast |
| **Claude** | Great quality, long context | Moderate cost | $$$ | Fast |
| **Gemini** | Cheapest, fast | Newer, less tested | $ | Very Fast |

### Model Selection

#### OpenAI Models

```bash
# Best quality (expensive)
LLM_MODEL=gpt-4-turbo-preview

# Good balance
LLM_MODEL=gpt-4

# Fast & cheap
LLM_MODEL=gpt-3.5-turbo
```

#### Claude Models

```bash
# Best quality
LLM_MODEL=claude-3-5-sonnet-20241022

# Balanced
LLM_MODEL=claude-3-opus-20240229

# Fast & cheap
LLM_MODEL=claude-3-haiku-20240307
```

#### Gemini Models

```bash
# Best quality
LLM_MODEL=gemini-1.5-pro-latest

# Fast & cheap
LLM_MODEL=gemini-1.5-flash-latest
```

## Getting API Keys

### OpenAI

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)
6. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

**Cost:** $0.01-0.06 per 1K tokens depending on model

### Anthropic (Claude)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

**Cost:** $0.003-0.015 per 1K tokens depending on model

### Google (Gemini)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click **Create API Key**
4. Select or create a project
5. Copy the generated key
6. Add to `.env`:
   ```bash
   GOOGLE_AI_API_KEY=your-key-here
   ```

**Cost:** Free tier available, then $0.0005-0.002 per 1K tokens

## Testing AI Setup

### 1. Check Configuration

```bash
cd /home/user/studio/wavelaunch-crm/backend
npm start
```

Look for these lines in output:
```
✓ LLM Service initialized with provider: openai (gpt-4-turbo-preview)
```

If you see:
```
⚠ openai client not initialized. Check API key in .env
```

Then the API key is missing or invalid.

### 2. Test Lead Analysis

```bash
curl -X POST http://localhost:5000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Creator",
    "email": "test@example.com",
    "niche": "Fitness",
    "followers": 50000,
    "summary": "Fitness coach looking to build online course platform",
    "autoAnalyze": true
  }'
```

Check response for `aiAnalysis` field with AI-generated insights.

### 3. Test Document Generation

```bash
# First, create a client
CLIENT_ID=$(curl -s -X POST http://localhost:5000/api/v1/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Client", "email": "client@test.com"}' \
  | jq -r '.data.id')

# Generate Month 1 documents
curl -X POST "http://localhost:5000/api/v1/clients/$CLIENT_ID/onboarding-kit/month/1/generate"
```

Should return:
```json
{
  "success": true,
  "message": "Generated 5 documents for Month 1",
  "documents": [...]
}
```

## Error Handling

### "OpenAI client not initialized"

**Problem:** API key not set or invalid

**Solution:**
1. Check `.env` file exists: `ls -la /home/user/studio/wavelaunch-crm/backend/.env`
2. Verify key is set: `grep OPENAI_API_KEY .env`
3. Restart server: `npm start`

### "Rate limit exceeded"

**Problem:** Too many API requests

**Solution:**
1. Wait a few seconds
2. Upgrade API plan
3. Switch to different provider temporarily

### "Invalid API key"

**Problem:** API key is wrong or expired

**Solution:**
1. Generate new key from provider dashboard
2. Update `.env` file
3. Restart server

### "Context length exceeded"

**Problem:** Document generation requires too many tokens

**Solution:**
1. Increase `LLM_MAX_TOKENS`:
   ```bash
   LLM_MAX_TOKENS=4000
   ```
2. Use model with larger context:
   - OpenAI: `gpt-4-turbo-preview` (128K context)
   - Claude: `claude-3-5-sonnet-20241022` (200K context)
   - Gemini: `gemini-1.5-pro-latest` (2M context)

## Features Using AI

### 1. Lead Analysis

- Automatically analyzes lead applications
- Generates fit scores (0-100)
- Provides sentiment analysis
- Creates summaries and recommendations

**API Endpoint:** `POST /api/v1/leads/:id/analyze`

### 2. Document Generation

- Generates 8-month onboarding program documents
- Creates personalized content per client
- Includes business plans, marketing strategies, etc.

**API Endpoint:** `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/generate`

### 3. Document Summarization

- Summarizes long documents
- Extracts key points
- Provides executive summaries

**API Endpoint:** `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/summarize`

### 4. Quality Checks

- Reviews document quality
- Identifies gaps or issues
- Suggests improvements

**API Endpoint:** `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/quality-check`

### 5. Metric Extraction

- Extracts KPIs from documents
- Identifies goals and targets
- Tracks progress metrics

**API Endpoint:** `POST /api/v1/clients/:clientId/onboarding-kit/month/:monthNumber/document/:docNumber/extract-metrics`

## Cost Management

### Estimate Costs

**Lead Analysis:**
- ~500-1000 tokens per lead
- Cost: $0.01-0.05 per lead (OpenAI GPT-4)

**Document Generation:**
- ~2000-4000 tokens per document
- 8 months × 5 docs = 40 documents per client
- Cost: $2-8 per client (OpenAI GPT-4)

### Reduce Costs

1. **Use cheaper models:**
   ```bash
   LLM_MODEL=gpt-3.5-turbo  # 10x cheaper than GPT-4
   ```

2. **Switch providers:**
   ```bash
   LLM_PROVIDER=gemini  # Much cheaper than OpenAI
   ```

3. **Disable auto-analysis:**
   ```bash
   AUTO_ANALYZE_NEW_LEADS=false
   ```

4. **Set token limits:**
   ```bash
   LLM_MAX_TOKENS=2000  # Lower = cheaper
   ```

## Troubleshooting

### Check Service Status

```bash
# View logs
tail -f /home/user/studio/wavelaunch-crm/backend/logs/server.log

# Test API directly
curl http://localhost:5000/api/v1/health
```

### Verify API Key

```bash
# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Claude key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"

# Test Gemini key
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_AI_API_KEY"
```

### Common Issues

**Issue:** Server starts but AI features fail
**Solution:** API key may be in wrong format or expired

**Issue:** Some features work, others don't
**Solution:** Check token limits and model capabilities

**Issue:** Slow response times
**Solution:** Switch to faster model (Gemini Flash, GPT-3.5-turbo)

## Security Best Practices

1. **Never commit .env to git:**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Rotate keys regularly:**
   - Generate new keys monthly
   - Revoke old keys

3. **Use environment-specific keys:**
   - Development keys for local
   - Production keys for deployed

4. **Monitor usage:**
   - Set up billing alerts
   - Track token consumption

5. **Restrict key permissions:**
   - Use read-only keys if available
   - Limit to specific endpoints

## Production Deployment

### Environment Variables

Set these in production environment:

```bash
# Required
OPENAI_API_KEY=sk-prod-key-here
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo-preview

# Optional but recommended
LLM_MAX_TOKENS=2000
AUTO_ANALYZE_NEW_LEADS=true
```

### Docker

Add to docker-compose.yml:

```yaml
services:
  backend:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LLM_PROVIDER=openai
      - LLM_MODEL=gpt-4-turbo-preview
```

### Health Monitoring

Monitor these metrics:

- API response times
- Token usage per day
- Error rates
- Cost per client

## Support

For issues:
1. Check this guide
2. Review error messages
3. Test API keys directly
4. Check provider status pages:
   - OpenAI: https://status.openai.com/
   - Anthropic: https://status.anthropic.com/
   - Google: https://status.cloud.google.com/

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
