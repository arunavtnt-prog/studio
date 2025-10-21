"""
Markdown generation module for business plans.
"""

from pathlib import Path
from typing import Dict, List
from datetime import datetime

from .content_generator import SectionContent
from .input_handler import ApplicationData


class MarkdownGenerator:
    """Generate structured Markdown documents from business plan content."""

    def __init__(self, output_dir: str = "output"):
        """
        Initialize Markdown generator.

        Args:
            output_dir: Directory to save Markdown files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_business_plan(
        self,
        data: ApplicationData,
        sections: Dict[str, SectionContent],
        charts: Dict[str, str],
        creator_name: str
    ) -> str:
        """
        Generate complete business plan in Markdown.

        Args:
            data: Application data
            sections: Generated content sections
            charts: Chart file paths
            creator_name: Creator name for file naming

        Returns:
            Path to generated Markdown file
        """
        print("Generating Markdown document...")

        markdown_content = []

        # Title Page
        markdown_content.append(self._generate_title_page(data))
        markdown_content.append("\n---\n\n")

        # Table of Contents
        markdown_content.append(self._generate_table_of_contents(sections))
        markdown_content.append("\n---\n\n")

        # Executive Summary (with charts)
        if "Executive Summary" in sections:
            markdown_content.append(f"# Executive Summary\n\n")
            markdown_content.append(sections["Executive Summary"].content)
            markdown_content.append("\n\n")

            # Add key metrics visualization
            if 'market_sizing' in charts:
                markdown_content.append(f"![Market Sizing]({charts['market_sizing']})\n\n")

            markdown_content.append("\n---\n\n")

        # All other sections
        for section_name in sections.keys():
            if section_name == "Executive Summary":
                continue  # Already added

            markdown_content.append(f"# {section_name}\n\n")
            markdown_content.append(sections[section_name].content)
            markdown_content.append("\n\n")

            # Add relevant charts to sections
            chart_mapping = {
                "Target Audience & Customer Persona": 'audience_demographics',
                "Competitive Landscape": 'competitive_matrix',
                "Financial Projections": 'revenue_projections',
                "Milestones & Roadmap": 'milestone_timeline',
                "Marketing & Growth Channels": 'customer_acquisition',
                "Market Analysis & Opportunity": 'market_share',
            }

            if section_name in chart_mapping and chart_mapping[section_name] in charts:
                chart_path = charts[chart_mapping[section_name]]
                markdown_content.append(f"\n![{section_name} Visualization]({chart_path})\n\n")

            markdown_content.append("\n---\n\n")

        # Footer
        markdown_content.append(self._generate_footer())

        # Combine all content
        full_content = "".join(markdown_content)

        # Save to file
        filename = f"business-plan-{creator_name.lower().replace(' ', '-')}.md"
        filepath = self.output_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)

        print(f"  ✓ Markdown saved to: {filepath}")
        return str(filepath)

    def _generate_title_page(self, data: ApplicationData) -> str:
        """Generate title page content."""
        return f"""# Business Plan

## {data.venture_vision if data.venture_vision else 'Venture Name'}

**Prepared for:** {data.full_name}
**Industry:** {data.target_industry}
**Date:** {datetime.now().strftime('%B %d, %Y')}

**Contact:** {data.email}

---

## Confidential

This business plan contains proprietary and confidential information.
Do not reproduce or distribute without permission.

"""

    def _generate_table_of_contents(self, sections: Dict[str, SectionContent]) -> str:
        """Generate table of contents."""
        toc = ["# Table of Contents\n\n"]

        for i, section_name in enumerate(sections.keys(), 1):
            # Create anchor link (lowercase, replace spaces with hyphens)
            anchor = section_name.lower().replace(' ', '-').replace('&', '').replace('  ', ' ')
            toc.append(f"{i}. [{section_name}](#{anchor})\n")

        return "".join(toc)

    def _generate_footer(self) -> str:
        """Generate document footer."""
        return f"""---

## Document Information

**Generated:** {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
**Version:** 1.0
**Status:** Draft

---

*This business plan was generated using an AI-powered business planning system.
All projections and analyses should be validated with market research and expert consultation.*

"""

    def generate_executive_summary_only(
        self,
        data: ApplicationData,
        summary_content: str,
        creator_name: str
    ) -> str:
        """
        Generate standalone executive summary document.

        Args:
            data: Application data
            summary_content: Executive summary content
            creator_name: Creator name

        Returns:
            Path to generated file
        """
        content = f"""# Executive Summary

## {data.venture_vision}

**Founder:** {data.full_name}
**Industry:** {data.target_industry}
**Date:** {datetime.now().strftime('%B %d, %Y')}

---

{summary_content}

---

**Contact Information:**
Email: {data.email}

"""

        filename = f"executive-summary-{creator_name.lower().replace(' ', '-')}.md"
        filepath = self.output_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(filepath)

    def generate_data_tables(self, data: ApplicationData) -> str:
        """Generate Markdown tables with key data points."""
        tables = []

        # Target Audience Table
        if any([data.target_demographic_age, data.audience_gender_profile,
                data.audience_marital_status]):
            tables.append("### Target Audience Demographics\n\n")
            tables.append("| Attribute | Details |\n")
            tables.append("|-----------|----------|\n")

            if data.target_demographic_age:
                tables.append(f"| Age Range | {data.target_demographic_age} |\n")
            if data.audience_gender_profile:
                tables.append(f"| Gender Profile | {data.audience_gender_profile} |\n")
            if data.audience_marital_status:
                tables.append(f"| Marital Status | {data.audience_marital_status} |\n")

            tables.append("\n")

        # Brand Attributes Table
        if any([data.brand_personality, data.brand_emotions, data.brand_values]):
            tables.append("### Brand Attributes\n\n")
            tables.append("| Attribute | Description |\n")
            tables.append("|-----------|-------------|\n")

            if data.brand_personality:
                tables.append(f"| Personality | {data.brand_personality} |\n")
            if data.brand_emotions:
                tables.append(f"| Emotions | {data.brand_emotions} |\n")
            if data.brand_values:
                tables.append(f"| Values | {data.brand_values} |\n")

            tables.append("\n")

        # Milestones Table (sample - would be populated from data)
        tables.append("### Key Milestones\n\n")
        tables.append("| Timeline | Milestone | KPI |\n")
        tables.append("|----------|-----------|-----|\n")
        tables.append("| Month 1-3 | MVP Launch | Product live, first users |\n")
        tables.append("| Month 4-6 | Market Validation | 1,000 customers, $50K MRR |\n")
        tables.append("| Month 7-12 | Growth Phase | $500K ARR, break even |\n")
        tables.append("| Year 2 | Scale | $2M ARR, Series A |\n")
        tables.append("| Year 3 | Expansion | $5M ARR, profitability |\n\n")

        return "".join(tables)

    def create_quick_reference_sheet(self, data: ApplicationData, creator_name: str) -> str:
        """Create a one-page quick reference sheet."""
        content = f"""# Business Plan Quick Reference

## {data.venture_vision}

### Core Information

- **Founder:** {data.full_name}
- **Industry:** {data.target_industry}
- **Target Audience:** {data.target_audience}

### Value Proposition

{data.unique_value_proposition}

### Key Differentiators

{data.competitive_differentiation}

### Growth Strategy

{data.growth_strategy if data.growth_strategy else 'Multi-channel acquisition and retention'}

### Scaling Goals

{data.scaling_goals if data.scaling_goals else 'Sustainable growth with path to profitability'}

### Brand Identity

- **Personality:** {data.brand_personality if data.brand_personality else 'Professional, innovative'}
- **Values:** {data.brand_values if data.brand_values else 'Customer-centric, quality-driven'}
- **Emotions:** {data.brand_emotions if data.brand_emotions else 'Trust, inspiration, empowerment'}

### Financial Snapshot

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | $500K | $2M | $5M |
| Customers | 5,000 | 20,000 | 50,000 |
| Team Size | 5 | 15 | 30 |

---

*Generated: {datetime.now().strftime('%B %d, %Y')}*
"""

        filename = f"quick-reference-{creator_name.lower().replace(' ', '-')}.md"
        filepath = self.output_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(filepath)
