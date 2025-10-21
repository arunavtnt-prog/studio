# Business Plan Generator - Usage Guide

This guide provides detailed examples and best practices for using the Business Plan Generator.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Preparing Your Input](#preparing-your-input)
3. [Generation Workflows](#generation-workflows)
4. [Customization Examples](#customization-examples)
5. [Advanced Usage](#advanced-usage)
6. [Tips for Best Results](#tips-for-best-results)

## Getting Started

### First-Time Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up API key:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. **Validate installation:**
   ```bash
   python main.py --validate
   ```

4. **Test with sample data:**
   ```bash
   python main.py sample_data/sample_input.json
   ```

## Preparing Your Input

### Tips for High-Quality Input

1. **Be Specific**: More detail = better output
   - ❌ "Fashion business"
   - ✅ "Sustainable artisan fashion marketplace connecting eco-conscious consumers with verified independent creators"

2. **Include Numbers**: Quantify where possible
   - ❌ "Good career background"
   - ✅ "15 years in fashion retail, former VP at $50M brand, launched $10M e-commerce platform"

3. **Tell Stories**: Narrative details enhance content
   - ❌ "From New York"
   - ✅ "Grew up in Brooklyn witnessing artisan market transformation, mother's jewelry business inspired journey"

### Input Data Quality Checklist

- [ ] Full name and contact email provided
- [ ] Clear, specific venture vision (not just a category)
- [ ] Detailed target audience (demographics + psychographics)
- [ ] Specific pain points (3-5 concrete problems)
- [ ] Quantified metrics where possible (revenue, customers, etc.)
- [ ] Competitor names (at least 3-5)
- [ ] Brand attributes (personality, values, emotions)
- [ ] Timeline with specific milestones

## Generation Workflows

### Workflow 1: Quick Preview

For initial review or when iterating on input:

```bash
# Generate only executive summary (30 seconds)
python main.py input.json --summary-only

# Review output/executive-summary-[name].md
# Refine input based on output
# Repeat until satisfied
```

### Workflow 2: Full Business Plan

For complete, investor-ready documents:

```bash
# Generate full plan with PDF (10-20 minutes)
python main.py input.json

# Output:
# - business-plan-[name].md (editable)
# - business-plan-[name].pdf (investor-ready)
# - 7+ visualization charts
```

### Workflow 3: Pitch Deck Package

For investor presentations:

```bash
# Generate plan + pitch deck
python main.py input.json --pitch-deck

# Output includes:
# - Full business plan (MD + PDF)
# - Pitch deck PDF (10-15 slides)
# - All visualizations
```

### Workflow 4: Markdown Only

For further editing before PDF:

```bash
# Generate Markdown, skip PDF
python main.py input.json --no-pdf

# Edit the markdown file
# Generate PDF later manually or with custom styling
```

## Customization Examples

### Example 1: Change Branding Colors

Edit `config/branding.py`:

```python
# Change to your brand colors
PRIMARY_COLOR: str = "#2C3E50"  # Your navy
ACCENT_COLOR: str = "#E74C3C"   # Your red
HIGHLIGHT_COLOR: str = "#3498DB" # Your blue
```

### Example 2: Adjust Content Length

Edit `config/settings.py`:

```python
# Make sections longer/shorter
SECTION_MIN_WORDS: int = 1200  # Default is 800

# Target different page count
TARGET_PAGE_COUNT: int = 75  # Default is 50
```

### Example 3: Change AI Provider

```bash
# Use OpenAI instead of Anthropic
python main.py input.json --ai-provider openai
```

Or edit `config/settings.py`:

```python
AI_PROVIDER: str = "openai"
OPENAI_MODEL: str = "gpt-4-turbo-preview"
```

### Example 4: Custom Section Order

Edit `config/settings.py`:

```python
SECTIONS: List[str] = [
    "Executive Summary",
    "Founder Story & Background",  # Move earlier
    "Vision & Mission",
    # ... rest of sections
]
```

### Example 5: Add Custom Section

1. Add to `config/settings.py`:
   ```python
   SECTIONS: List[str] = [
       # ... existing sections ...
       "Technology Stack",  # New section
       "Appendices"
   ]
   ```

2. Add prompt in `src/content_generator.py`:
   ```python
   section_prompts = {
       # ... existing prompts ...
       "Technology Stack": f"""
       Write a detailed Technology Stack section (1000 words).
       Cover: architecture, languages, frameworks, infrastructure, security.
       """
   }
   ```

## Advanced Usage

### Batch Processing

Process multiple applications:

```bash
# Create a batch script
cat > batch_process.sh << 'EOF'
#!/bin/bash
for file in applications/*.json; do
    echo "Processing $file..."
    python main.py "$file" --quiet
done
EOF

chmod +x batch_process.sh
./batch_process.sh
```

### Custom Output Location

```bash
# Organize by date
OUTPUT_DIR="plans/$(date +%Y-%m-%d)"
python main.py input.json --output-dir "$OUTPUT_DIR"
```

### Integration with Other Tools

**Export to Google Docs:**
```bash
# Generate Markdown
python main.py input.json --no-pdf

# Convert to DOCX with pandoc
pandoc output/business-plan-[name].md -o plan.docx

# Upload to Google Drive (using gdrive CLI)
gdrive upload plan.docx
```

**Automate with Cron:**
```bash
# Add to crontab
0 9 * * * cd /path/to/generator && python main.py /path/to/input.json
```

### Python API Usage

Use as a library:

```python
from config.settings import Settings
from src.orchestrator import BusinessPlanOrchestrator

# Custom settings
settings = Settings()
settings.AI_PROVIDER = "anthropic"
settings.SECTION_MIN_WORDS = 1000

# Generate
orchestrator = BusinessPlanOrchestrator(settings)
results = orchestrator.generate_business_plan(
    input_path="input.json",
    generate_pdf=True,
    verbose=True
)

print(f"Generated: {results['pdf']}")
```

## Tips for Best Results

### Content Tips

1. **Be Authentic**: Use real founder stories and experiences
2. **Data-Driven**: Include actual market research and numbers
3. **Specific Names**: Mention real competitors, brands, tools
4. **Concrete Examples**: "Instagram and Pinterest" vs "social media"
5. **Quantify Goals**: "$2M ARR by Year 2" vs "grow revenue"

### Input Optimization

**Good Example:**
```json
{
  "target_audience": "Urban professionals, 28-42, HHI $100K-200K, primarily women, living in NYC/SF/LA, shop at Whole Foods, read NYT, follow sustainability influencers on Instagram, frustrated with fast fashion quality and ethics, willing to pay 30-50% premium for sustainable alternatives"
}
```

**Poor Example:**
```json
{
  "target_audience": "People who like sustainable fashion"
}
```

### Iteration Strategy

1. **Start Small**: Use `--summary-only` to test
2. **Review & Refine**: Check if AI understood your input
3. **Add Detail**: Enhance input based on gaps in summary
4. **Generate Full**: Run complete generation when satisfied
5. **Edit Output**: Markdown is editable - refine as needed

### Common Pitfalls to Avoid

❌ **Vague descriptions**: "Good product", "Big market"
✅ **Specific details**: "Handcrafted leather goods with lifetime warranty", "$15B sustainable fashion market growing 25% YoY"

❌ **Missing context**: Just listing features
✅ **Full context**: Features + benefits + target persona + use case

❌ **Generic competitors**: "Other platforms"
✅ **Named competitors**: "Etsy, Faire, The Citizenry"

## Example Workflows by Use Case

### For Accelerator Application Review

```bash
# Quick review of many applications
for app in applications/*.json; do
    python main.py "$app" --summary-only --quiet
done

# Review summaries to shortlist
# Generate full plans for finalists
python main.py finalist1.json
python main.py finalist2.json
```

### For Founder Self-Assessment

```bash
# Generate initial plan
python main.py my-venture.json

# Review gaps in output
# Enhance input with missing details
# Regenerate
python main.py my-venture-v2.json
```

### For Investor Pitch Preparation

```bash
# Generate comprehensive package
python main.py venture.json --pitch-deck

# You get:
# - Full business plan for detailed review
# - Pitch deck for presentation
# - Charts for embedding in other materials
```

## Troubleshooting

### Output Quality Issues

**Problem**: Content is too generic

**Solution**:
- Add more specific details to input
- Include real data, names, numbers
- Provide concrete examples

**Problem**: Sections are repetitive

**Solution**:
- Edit section prompts in `src/content_generator.py`
- Adjust temperature in `config/settings.py` (try 0.6-0.8)

### Performance Issues

**Problem**: Generation is too slow

**Solution**:
- Use faster AI model (Claude 3 Haiku or GPT-3.5)
- Reduce `SECTION_MIN_WORDS`
- Use `--summary-only` for testing

**Problem**: API rate limiting

**Solution**:
- Increase delay in `src/content_generator.py`
- Use higher-tier API plan
- Process in smaller batches

## Getting Help

- Check README.md for setup and basics
- Review sample_data/ for input examples
- Open GitHub issue for bugs
- Review generated markdown to understand what AI created

---

**Happy business plan generating!** 🚀
