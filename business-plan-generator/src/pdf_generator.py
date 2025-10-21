"""
PDF generation module with NYC branding and professional styling.
Uses WeasyPrint for HTML to PDF conversion with custom CSS.
"""

import os
import re
from pathlib import Path
from typing import Optional
from datetime import datetime
import markdown

from config.branding import BrandingConfig
from .input_handler import ApplicationData


class PDFGenerator:
    """Generate professionally branded PDFs from Markdown content."""

    def __init__(self, branding: Optional[BrandingConfig] = None, output_dir: str = "output"):
        """
        Initialize PDF generator.

        Args:
            branding: Branding configuration
            output_dir: Directory to save PDF files
        """
        self.branding = branding or BrandingConfig()
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Try to import WeasyPrint
        try:
            from weasyprint import HTML, CSS
            self.HTML = HTML
            self.CSS = CSS
            self.weasyprint_available = True
        except ImportError:
            print("Warning: WeasyPrint not available. PDF generation will be limited.")
            self.weasyprint_available = False

    def generate_pdf_from_markdown(
        self,
        markdown_path: str,
        data: ApplicationData,
        creator_name: str,
        output_filename: Optional[str] = None
    ) -> str:
        """
        Generate PDF from Markdown file.

        Args:
            markdown_path: Path to Markdown file
            data: Application data for title page
            creator_name: Creator name
            output_filename: Optional custom output filename

        Returns:
            Path to generated PDF
        """
        if not self.weasyprint_available:
            raise RuntimeError("WeasyPrint is required for PDF generation")

        print("Generating PDF document...")

        # Read Markdown content
        with open(markdown_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        # Convert Markdown to HTML
        html_content = self._markdown_to_html(md_content, data)

        # Generate PDF
        if output_filename is None:
            output_filename = f"business-plan-{creator_name.lower().replace(' ', '-')}.pdf"

        output_path = self.output_dir / output_filename

        # Create CSS
        css_content = self.branding.get_css_styles()

        # Additional PDF-specific CSS
        pdf_css = self._get_pdf_specific_css()
        full_css = css_content + "\n" + pdf_css

        # Generate PDF using WeasyPrint
        html = self.HTML(string=html_content)
        css = self.CSS(string=full_css)

        html.write_pdf(
            output_path,
            stylesheets=[css],
        )

        print(f"  ✓ PDF saved to: {output_path}")
        return str(output_path)

    def _markdown_to_html(self, md_content: str, data: ApplicationData) -> str:
        """
        Convert Markdown to HTML with custom styling.

        Args:
            md_content: Markdown content
            data: Application data

        Returns:
            HTML string
        """
        # Configure markdown extensions
        extensions = [
            'markdown.extensions.tables',
            'markdown.extensions.fenced_code',
            'markdown.extensions.nl2br',
            'markdown.extensions.sane_lists',
        ]

        # Convert to HTML
        html_body = markdown.markdown(md_content, extensions=extensions)

        # Process for better styling
        html_body = self._enhance_html(html_body)

        # Build complete HTML document
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Plan - {data.full_name}</title>
</head>
<body>
    {self._create_cover_page(data)}
    <div class="main-content">
        {html_body}
    </div>
</body>
</html>
"""
        return html

    def _create_cover_page(self, data: ApplicationData) -> str:
        """Create professional cover page HTML."""
        return f"""
<div class="title-page">
    <div class="cover-header">
        <div class="cover-accent-line"></div>
        <h1 class="cover-title">Business Plan</h1>
        <div class="cover-accent-line"></div>
    </div>

    <div class="cover-main">
        <p class="cover-venture-name">{data.venture_vision or 'Strategic Venture'}</p>
        <p class="cover-industry">{data.target_industry}</p>
    </div>

    <div class="cover-footer">
        <div class="cover-info">
            <p><strong>Prepared for:</strong> {data.full_name}</p>
            <p><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
            <p><strong>Contact:</strong> {data.email}</p>
        </div>

        <div class="cover-confidential">
            <p>CONFIDENTIAL</p>
            <p class="cover-confidential-note">
                This document contains proprietary and confidential information.
                Do not reproduce or distribute without permission.
            </p>
        </div>
    </div>
</div>

<div class="page-break"></div>
"""

    def _enhance_html(self, html: str) -> str:
        """Enhance HTML with additional styling classes."""
        # Wrap horizontal rules with section dividers
        html = html.replace('<hr>', '<hr class="section-divider">')

        # Add classes to images
        html = re.sub(
            r'<img ([^>]*)>',
            r'<div class="chart-container"><img \1></div>',
            html
        )

        # Enhance tables
        html = re.sub(
            r'<table>',
            r'<div class="table-wrapper"><table>',
            html
        )
        html = html.replace('</table>', '</table></div>')

        # Add highlight boxes for important paragraphs (starting with > in markdown)
        html = re.sub(
            r'<blockquote>(.*?)</blockquote>',
            r'<div class="highlight-box">\1</div>',
            html,
            flags=re.DOTALL
        )

        return html

    def _get_pdf_specific_css(self) -> str:
        """Get additional CSS specific to PDF generation."""
        return f"""
        .page-break {{
            page-break-after: always;
        }}

        .cover-header {{
            text-align: center;
            padding-top: 100pt;
            margin-bottom: 60pt;
        }}

        .cover-accent-line {{
            width: 200pt;
            height: 3pt;
            background: linear-gradient(to right,
                {self.branding.ACCENT_COLOR},
                {self.branding.PRIMARY_COLOR});
            margin: 20pt auto;
        }}

        .cover-title {{
            font-family: '{self.branding.HEADER_FONT}', sans-serif;
            font-size: 48pt;
            color: {self.branding.PRIMARY_COLOR};
            font-weight: 700;
            letter-spacing: 2pt;
            text-transform: uppercase;
            margin: 0;
        }}

        .cover-main {{
            text-align: center;
            padding: 40pt 0;
        }}

        .cover-venture-name {{
            font-family: '{self.branding.ACCENT_FONT}', serif;
            font-size: 32pt;
            color: {self.branding.ACCENT_COLOR};
            font-weight: 600;
            margin-bottom: 20pt;
            line-height: 1.4;
        }}

        .cover-industry {{
            font-family: '{self.branding.BODY_FONT}', sans-serif;
            font-size: 18pt;
            color: {self.branding.LIGHT_TEXT};
            font-style: italic;
            margin-top: 0;
        }}

        .cover-footer {{
            position: absolute;
            bottom: 80pt;
            left: {self.branding.PAGE_MARGIN}pt;
            right: {self.branding.PAGE_MARGIN}pt;
        }}

        .cover-info {{
            margin-bottom: 40pt;
        }}

        .cover-info p {{
            font-size: {self.branding.BODY_SIZE}pt;
            margin: 8pt 0;
            color: {self.branding.TEXT_COLOR};
        }}

        .cover-confidential {{
            border-top: 2pt solid {self.branding.ACCENT_COLOR};
            padding-top: 20pt;
            text-align: center;
        }}

        .cover-confidential > p:first-child {{
            font-size: 14pt;
            font-weight: 700;
            color: {self.branding.ACCENT_COLOR};
            letter-spacing: 3pt;
            margin-bottom: 10pt;
        }}

        .cover-confidential-note {{
            font-size: {self.branding.CAPTION_SIZE}pt;
            color: {self.branding.LIGHT_TEXT};
            font-style: italic;
        }}

        .main-content {{
            margin-top: 0;
        }}

        .table-wrapper {{
            overflow-x: auto;
            margin: {self.branding.PARAGRAPH_SPACING}pt 0;
        }}

        img {{
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }}

        /* Prevent orphaned headings */
        h1, h2, h3 {{
            page-break-after: avoid;
        }}

        /* Keep tables together */
        table {{
            page-break-inside: avoid;
        }}

        /* Keep images with their captions */
        .chart-container {{
            page-break-inside: avoid;
        }}

        /* Better list styling */
        ul {{
            list-style-type: disc;
        }}

        ul ul {{
            list-style-type: circle;
        }}

        ol {{
            list-style-type: decimal;
        }}

        li {{
            line-height: 1.8;
        }}

        /* Code blocks (if any) */
        code {{
            background-color: {self.branding.SECTION_BG};
            padding: 2pt 6pt;
            border-radius: 3pt;
            font-family: 'Courier New', monospace;
            font-size: {self.branding.BODY_SIZE - 1}pt;
        }}

        pre {{
            background-color: {self.branding.SECTION_BG};
            padding: 15pt;
            border-radius: 4pt;
            border-left: 4pt solid {self.branding.ACCENT_COLOR};
            overflow-x: auto;
        }}

        pre code {{
            background: none;
            padding: 0;
        }}

        /* Strong emphasis */
        strong {{
            color: {self.branding.PRIMARY_COLOR};
            font-weight: 600;
        }}

        /* Emphasis */
        em {{
            color: {self.branding.HIGHLIGHT_COLOR};
            font-style: italic;
        }}

        /* Links (for table of contents) */
        a {{
            color: {self.branding.ACCENT_COLOR};
            text-decoration: none;
        }}

        a:hover {{
            text-decoration: underline;
        }}
        """

    def create_pitch_deck_pdf(
        self,
        data: ApplicationData,
        sections: dict,
        charts: dict,
        creator_name: str
    ) -> str:
        """
        Create a condensed pitch deck style PDF (10-15 slides worth).

        Args:
            data: Application data
            sections: Generated content sections
            charts: Chart paths
            creator_name: Creator name

        Returns:
            Path to pitch deck PDF
        """
        if not self.weasyprint_available:
            raise RuntimeError("WeasyPrint is required for PDF generation")

        print("Generating pitch deck PDF...")

        # Create pitch deck HTML
        html_content = self._create_pitch_deck_html(data, sections, charts)

        # Pitch deck specific CSS
        css_content = self._get_pitch_deck_css()

        output_filename = f"pitch-deck-{creator_name.lower().replace(' ', '-')}.pdf"
        output_path = self.output_dir / output_filename

        # Generate PDF
        html = self.HTML(string=html_content)
        css = self.CSS(string=css_content)

        html.write_pdf(output_path, stylesheets=[css])

        print(f"  ✓ Pitch deck PDF saved to: {output_path}")
        return str(output_path)

    def _create_pitch_deck_html(
        self,
        data: ApplicationData,
        sections: dict,
        charts: dict
    ) -> str:
        """Create HTML for pitch deck slides."""
        slides = []

        # Slide 1: Cover
        slides.append(f"""
<div class="slide">
    <h1>{data.venture_vision}</h1>
    <p class="subtitle">{data.target_industry}</p>
    <p class="founder">{data.full_name}</p>
</div>
""")

        # Slide 2: Problem
        slides.append(f"""
<div class="slide">
    <h2>The Problem</h2>
    <p class="big-text">{data.audience_pain_points or 'Market inefficiencies and unmet customer needs'}</p>
</div>
""")

        # Slide 3: Solution
        slides.append(f"""
<div class="slide">
    <h2>Our Solution</h2>
    <p class="big-text">{data.unique_value_proposition}</p>
</div>
""")

        # Slide 4: Market Opportunity (with chart)
        market_chart = f'<img src="{charts["market_sizing"]}" alt="Market Sizing">' if 'market_sizing' in charts else ''
        slides.append(f"""
<div class="slide">
    <h2>Market Opportunity</h2>
    {market_chart}
</div>
""")

        # Add more slides...
        # Slide 5: Competition, 6: Business Model, 7: Traction, 8: Team, 9: Financials, 10: Ask

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pitch Deck - {data.full_name}</title>
</head>
<body>
    {''.join(slides)}
</body>
</html>
"""
        return html

    def _get_pitch_deck_css(self) -> str:
        """CSS for pitch deck slides."""
        return f"""
@page {{
    size: 11in 8.5in landscape;
    margin: 0;
}}

body {{
    font-family: '{self.branding.BODY_FONT}', sans-serif;
    margin: 0;
    padding: 0;
}}

.slide {{
    width: 11in;
    height: 8.5in;
    padding: 60pt;
    box-sizing: border-box;
    page-break-after: always;
    background: white;
}}

.slide h1 {{
    font-family: '{self.branding.HEADER_FONT}', sans-serif;
    font-size: 48pt;
    color: {self.branding.PRIMARY_COLOR};
    text-align: center;
    margin-top: 180pt;
}}

.slide h2 {{
    font-family: '{self.branding.HEADER_FONT}', sans-serif;
    font-size: 36pt;
    color: {self.branding.PRIMARY_COLOR};
    margin-bottom: 40pt;
}}

.subtitle {{
    font-size: 24pt;
    color: {self.branding.ACCENT_COLOR};
    text-align: center;
    margin-top: 20pt;
}}

.founder {{
    font-size: 18pt;
    color: {self.branding.LIGHT_TEXT};
    text-align: center;
    margin-top: 100pt;
}}

.big-text {{
    font-size: 24pt;
    line-height: 1.6;
    color: {self.branding.TEXT_COLOR};
}}

img {{
    max-width: 100%;
    max-height: 500pt;
    display: block;
    margin: 20pt auto;
}}
"""
