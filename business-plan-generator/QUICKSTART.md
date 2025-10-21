# Quick Start Guide

Get your first business plan generated in 5 minutes!

## Prerequisites

- Python 3.8+ installed
- API key from OpenAI or Anthropic

## 5-Minute Setup

### 1. Install Dependencies (2 min)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt
```

### 2. Set API Key (30 sec)

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API key:
# ANTHROPIC_API_KEY=your-key-here
# or
# OPENAI_API_KEY=your-key-here
```

Or set as environment variable:
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### 3. Validate Setup (30 sec)

```bash
python main.py --validate
```

Should see: `✅ Environment validation passed!`

### 4. Generate Sample Business Plan (2 min)

```bash
python main.py sample_data/sample_input.json
```

Wait 10-20 minutes (AI is generating 50+ pages of content!)

### 5. View Output

```bash
ls -lh output/
```

You'll see:
- `business-plan-sarah-johnson.md` - Editable Markdown
- `business-plan-sarah-johnson.pdf` - Investor-ready PDF
- `charts/` - Data visualizations

## Create Your Own Business Plan

### Option 1: Use JSON

Create `my-venture.json`:

```json
{
  "full_name": "Your Name",
  "email": "you@example.com",
  "venture_vision": "Your Business Vision Here",
  "target_industry": "Your Industry",
  "target_audience": "Description of your target customers",
  "unique_value_proposition": "What makes you unique",
  "target_demographic_age": "25-45",
  "brand_personality": "innovative, trustworthy, bold",
  "scaling_goals": "Year 1: $500K, Year 2: $2M, Year 3: $5M"
}
```

Generate:
```bash
python main.py my-venture.json
```

### Option 2: Use Plain Text

Create `my-venture.txt`:

```
Full Name: Your Name
Email: you@example.com
Venture Vision: Your Business Vision
Target Industry: Your Industry
Target Audience: Your target customers
Unique Value Proposition: What makes you unique
...
```

Generate:
```bash
python main.py my-venture.txt
```

## Common Commands

```bash
# Full business plan (Markdown + PDF)
python main.py input.json

# Only Markdown (for editing first)
python main.py input.json --no-pdf

# Quick preview (executive summary only)
python main.py input.json --summary-only

# With pitch deck
python main.py input.json --pitch-deck

# Use specific AI provider
python main.py input.json --ai-provider openai
```

## Troubleshooting

### PDF Generation Fails?

Install system dependencies:

**macOS:**
```bash
brew install cairo pango gdk-pixbuf libffi
```

**Ubuntu:**
```bash
sudo apt-get install libcairo2 libpango-1.0-0 libgdk-pixbuf2.0-0
```

Then retry or skip PDF for now:
```bash
python main.py input.json --no-pdf
```

### API Key Issues?

Make sure environment variable is set:
```bash
echo $ANTHROPIC_API_KEY  # Should show your key
```

Or check `.env` file exists and has your key.

### Need Help?

- See `README.md` for full documentation
- Check `USAGE_GUIDE.md` for detailed examples
- Review `sample_data/` for input examples

## Tips for Best Results

1. **Provide detailed input** - More context = better output
2. **Be specific** - "Sustainable fashion marketplace" not just "fashion"
3. **Include numbers** - Revenue targets, customer counts, growth rates
4. **Name competitors** - Real company names, not "competitors"
5. **Tell your story** - Personal background, turning points, motivation

## Next Steps

1. Review generated plan
2. Edit Markdown file to refine content
3. Regenerate PDF from edited Markdown if needed
4. Customize branding in `config/branding.py`
5. Adjust settings in `config/settings.py`

---

**Need more help?** See README.md and USAGE_GUIDE.md

**Ready to generate!** 🚀
