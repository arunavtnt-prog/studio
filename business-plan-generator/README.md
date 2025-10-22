# Business Plan Generator

An AI-powered, end-to-end automation system that generates comprehensive, investor-ready business plans with professional NYC-themed branding. Built for brand accelerators to transform creator application forms into 50+ page strategic business plans with data visualizations and premium PDF output.

## 🌐 Web Interface Available!

**New!** User-friendly web interface perfect for non-technical users:

```bash
# Start the web interface
./start_web.sh        # Mac/Linux
start_web.bat         # Windows

# Then open: http://localhost:5000
```

**Features:**
- 📝 Easy form-based input (no coding required)
- 📁 Drag-and-drop file upload
- 👀 Preview executive summaries instantly
- 💾 Auto-save your work
- 📊 Download Markdown, PDF, and Pitch Deck
- 🎨 Beautiful NYC-themed interface

**For complete web UI instructions, see [WEB_UI_README.md](WEB_UI_README.md)**

---

## Features

- **Multi-Format Input Support**: Accepts JSON, CSV, and plain text input files
- **AI-Powered Content Generation**: Uses OpenAI GPT-4 or Anthropic Claude to generate strategic, narrative content
- **17 Comprehensive Sections**: Executive Summary, Vision & Mission, Market Analysis, Financial Projections, and more
- **Data Visualizations**: Auto-generates 7+ professional charts and graphs (market sizing, competitive analysis, revenue projections, etc.)
- **Dual Output Formats**:
  - Editable Markdown (.md) documents
  - Professionally branded PDF with NYC-inspired design
- **Premium Branding**: NYC-themed color palette, typography, and styling for investor-ready presentation
- **Modular Architecture**: Clean separation of concerns for easy customization and extension

## System Requirements

- Python 3.8 or higher
- API key for OpenAI or Anthropic
- System dependencies for PDF generation (see Installation)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/business-plan-generator.git
cd business-plan-generator
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install System Dependencies (for PDF generation)

**macOS:**
```bash
brew install cairo pango gdk-pixbuf libffi
```

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-dev python3-pip python3-cffi \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
```

**Windows:**
- Download and install GTK3 runtime from https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer
- Or use WSL2 with the Ubuntu instructions above

### 5. Set Up API Keys

Create a `.env` file in the project root or set environment variables:

```bash
# For OpenAI
export OPENAI_API_KEY="your-openai-api-key"

# OR for Anthropic (recommended)
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

Or create a `.env` file:
```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## Quick Start

### Option 1: Web Interface (Easiest!)

```bash
# Start the web server
./start_web.sh        # Mac/Linux
start_web.bat         # Windows

# Open http://localhost:5000 in your browser
# Fill out the form and generate your plan!
```

See [WEB_UI_README.md](WEB_UI_README.md) for complete web interface guide.

### Option 2: Command Line

#### 1. Validate Environment

```bash
python main.py --validate
```

#### 2. Generate Your First Business Plan

```bash
python main.py sample_data/sample_input.json
```

This will:
- Parse the input file
- Generate AI-powered content for all 17 sections
- Create data visualizations
- Output both Markdown and PDF files in the `output/` directory

#### 3. View Output

```bash
ls -lh output/
# business-plan-sarah-johnson.md
# business-plan-sarah-johnson.pdf
# charts/sarah-johnson_*.png
```

## Usage

### Basic Usage

Generate full business plan (Markdown + PDF):
```bash
python main.py input.json
```

### Command-Line Options

```bash
# Generate only Markdown (skip PDF)
python main.py input.csv --no-pdf

# Generate with pitch deck
python main.py input.txt --pitch-deck

# Generate only executive summary (faster)
python main.py input.json --summary-only

# Specify AI provider
python main.py input.json --ai-provider anthropic

# Custom output directory
python main.py input.json --output-dir ./my-plans

# Quiet mode (suppress progress messages)
python main.py input.json --quiet

# Show help
python main.py --help
```

## Input File Formats

The system accepts three input formats:

### JSON Format

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "venture_vision": "AI-powered sustainable fashion platform",
  "target_industry": "Fashion Tech",
  "target_audience": "Eco-conscious millennials",
  "unique_value_proposition": "Combining AI styling with sustainable brands",
  ...
}
```

See `sample_data/sample_input.json` for complete example.

### CSV Format

Create a CSV with headers matching the field names:

```csv
full_name,email,venture_vision,target_industry,...
"Jane Doe","jane@example.com","AI-powered fashion","Fashion Tech",...
```

See `sample_data/sample_input.csv` for complete example.

### Plain Text Format

Use `Field Name: Value` format:

```
Full Name: Jane Doe
Email: jane@example.com
Venture Vision: AI-powered sustainable fashion platform
Target Industry: Fashion Tech
...
```

See `sample_data/sample_input.txt` for complete example.

## Required Fields

The following fields are required for optimal output:

- `full_name`: Creator's full name
- `email`: Contact email
- `venture_vision`: Business vision/name
- `target_industry`: Industry or niche
- `target_audience`: Target customer description
- `unique_value_proposition`: Core value proposition

Additional fields enhance the output quality. See [Field Reference](#field-reference) below.

## Output Structure

```
output/
├── business-plan-[creator-name].md          # Markdown document
├── business-plan-[creator-name].pdf         # Branded PDF
├── pitch-deck-[creator-name].pdf            # Optional pitch deck
└── charts/
    ├── [creator]_market_sizing.png
    ├── [creator]_audience_demographics.png
    ├── [creator]_competitive_matrix.png
    ├── [creator]_revenue_projections.png
    ├── [creator]_milestone_timeline.png
    ├── [creator]_acquisition_funnel.png
    └── [creator]_market_share.png
```

## Document Sections

The generated business plan includes:

1. **Executive Summary** - High-level overview for investors
2. **Vision & Mission** - Long-term vision and core mission
3. **Founder Story & Background** - Credibility and journey
4. **Market Analysis & Opportunity** - Industry trends, TAM/SAM/SOM
5. **Target Audience & Customer Persona** - Detailed personas
6. **Competitive Landscape** - Competitor analysis and positioning
7. **Unique Value Proposition** - Core differentiation
8. **Brand Strategy & Identity** - Brand positioning and voice
9. **Product & Service Offering** - What's being sold
10. **Go-to-Market Strategy** - Launch and acquisition plan
11. **Marketing & Growth Channels** - Channel strategy
12. **Operations & Infrastructure** - Operational model
13. **Financial Projections** - 3-year financial model
14. **Milestones & Roadmap** - Timeline and KPIs
15. **Team & Advisors** - Organizational structure
16. **Risk Analysis & Mitigation** - Risk management
17. **Appendices** - Supporting documentation

## Customization

### Branding

Edit `config/branding.py` to customize:

- Color palette
- Typography (fonts, sizes)
- Spacing and layout
- Chart styling

```python
# Example: Change accent color
ACCENT_COLOR: str = "#your-color"
```

### Content Generation

Edit `config/settings.py` to adjust:

- AI provider and model
- Target page count
- Section order
- Output settings

```python
# Example: Use GPT-4
AI_PROVIDER: str = "openai"
OPENAI_MODEL: str = "gpt-4-turbo-preview"
```

### Section Prompts

Modify prompts in `src/content_generator.py` to change content tone, depth, or focus for each section.

## Architecture

### Module Overview

```
business-plan-generator/
├── config/                    # Configuration
│   ├── branding.py           # Visual branding settings
│   └── settings.py           # App settings
├── src/                       # Core modules
│   ├── input_handler.py      # Parse input files
│   ├── content_generator.py  # AI content generation
│   ├── visualizer.py         # Chart generation
│   ├── markdown_generator.py # Markdown output
│   ├── pdf_generator.py      # PDF generation
│   └── orchestrator.py       # Workflow coordination
├── sample_data/               # Example inputs
├── output/                    # Generated files
└── main.py                    # CLI entry point
```

### Data Flow

```
Input File (JSON/CSV/TXT)
    ↓
InputHandler (parse & validate)
    ↓
ContentGenerator (AI generates sections)
    ↓
DataVisualizer (create charts)
    ↓
MarkdownGenerator (assemble markdown)
    ↓
PDFGenerator (convert to branded PDF)
    ↓
Output Files
```

## Field Reference

### Personal Information
- `full_name`: Creator's name
- `email`: Contact email
- `career_milestones`: Professional background
- `personal_turning_points`: Key life events

### Venture Information
- `venture_vision`: Business name/vision
- `target_industry`: Industry or niche
- `target_audience`: Primary customers
- `demographic_profile`: Detailed demographics
- `audience_pain_points`: Customer problems

### Competitive Analysis
- `competitive_differentiation`: How you're different
- `unique_value_proposition`: Core value prop
- `competitors_monitored`: Key competitors

### Audience Details
- `target_demographic_age`: Age range
- `audience_gender_profile`: Gender breakdown
- `audience_marital_status`: Marital status
- `audience_discovery_methods`: How they find you

### Branding
- `brand_image`: Desired brand perception
- `brand_inspirations`: Brands you admire
- `branding_preferences`: Visual preferences
- `brand_emotions`: Emotional associations
- `brand_personality`: Personality traits
- `brand_font_choice`: Typography preferences
- `brand_values`: Core values

### Growth & Strategy
- `scaling_goals`: Growth targets
- `growth_strategy`: Marketing channels
- `brand_evolution_vision`: Long-term vision

### Additional
- `other_info`: Any other relevant info
- `deadlines_milestones`: Timeline

## Troubleshooting

### PDF Generation Issues

**Problem**: WeasyPrint import errors

**Solution**: Ensure system dependencies are installed (see Installation step 4)

**Problem**: Font not found errors

**Solution**: System fonts are used. Install suggested fonts or edit `config/branding.py` to use available fonts.

### API Issues

**Problem**: API key not found

**Solution**:
```bash
export ANTHROPIC_API_KEY="your-key-here"
# or create .env file
```

**Problem**: Rate limiting errors

**Solution**: Add delays in `src/content_generator.py` or use a higher-tier API plan.

### Content Quality

**Problem**: Generated content is too generic

**Solution**: Provide more detailed input data. The more context, the better the output.

**Problem**: Sections are too short

**Solution**: Adjust `SECTION_MIN_WORDS` in `config/settings.py`

## Development

### Running Tests

```bash
pip install -e ".[dev]"
pytest tests/
```

### Code Formatting

```bash
black .
flake8 .
mypy .
```

### Adding New Sections

1. Add section name to `SECTIONS` list in `config/settings.py`
2. Add prompt for section in `src/content_generator.py`
3. Optionally add section-specific chart in `src/visualizer.py`

### Creating Custom Visualizations

Add new chart methods to `src/visualizer.py`:

```python
def create_my_custom_chart(self, data, creator_name):
    fig, ax = plt.subplots(figsize=(10, 6))
    # Your chart code here
    filepath = self.output_dir / f"{creator_name}_custom.png"
    plt.savefig(filepath, dpi=self.branding.CHART_DPI)
    plt.close()
    return str(filepath)
```

## Performance

- **Executive Summary Only**: ~30 seconds
- **Full Business Plan**: 10-20 minutes (depends on API speed)
- **With PDF Generation**: +30-60 seconds

Tip: Use `--summary-only` for quick previews, then generate full plan when satisfied.

## Cost Estimates

### API Costs (approximate)

- **Anthropic Claude 3.5 Sonnet**: $3-5 per full business plan
- **OpenAI GPT-4 Turbo**: $4-7 per full business plan

Costs vary based on input detail and section length settings.

## Best Practices

1. **Provide Detailed Input**: More context = better output
2. **Review & Edit**: AI content should be reviewed and customized
3. **Validate Financial Projections**: Always verify numbers with real data
4. **Customize Branding**: Match your accelerator's brand identity
5. **Iterate**: Use executive summary mode to test, then generate full plan

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/yourusername/business-plan-generator/issues
- Documentation: See this README
- Examples: Check `sample_data/` directory

## Credits

Built with:
- OpenAI GPT-4 / Anthropic Claude for content generation
- WeasyPrint for PDF generation
- Matplotlib for data visualization
- Python 3.8+

## Roadmap

- [ ] Web UI for easier input
- [ ] Multi-language support
- [ ] Custom template system
- [ ] Collaborative editing features
- [ ] Integration with CRM systems
- [ ] Real-time market data integration
- [ ] A/B testing for investor pitches

---

**Version**: 1.0.0
**Last Updated**: 2025

Made with ❤️ for creators and entrepreneurs
