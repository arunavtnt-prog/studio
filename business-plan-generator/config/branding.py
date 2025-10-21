"""
NYC-themed branding configuration for business plan PDFs.
Premium, investor-ready styling with modern aesthetics.
"""

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class BrandingConfig:
    """NYC-inspired premium branding configuration."""

    # Color Palette - NYC Modern
    PRIMARY_COLOR: str = "#1a1a2e"  # Deep Navy (NYC night)
    SECONDARY_COLOR: str = "#16213e"  # Midnight Blue
    ACCENT_COLOR: str = "#e94560"  # Vibrant Red (energy)
    HIGHLIGHT_COLOR: str = "#0f3460"  # Rich Blue
    TEXT_COLOR: str = "#2d2d2d"  # Charcoal
    LIGHT_TEXT: str = "#6c757d"  # Muted Gray
    BACKGROUND: str = "#ffffff"  # Clean White
    SECTION_BG: str = "#f8f9fa"  # Light Gray

    # Typography
    HEADER_FONT: str = "Montserrat"  # Modern, clean
    BODY_FONT: str = "Source Sans Pro"  # Readable, professional
    ACCENT_FONT: str = "Playfair Display"  # Elegant touches

    # Font Sizes (in pt)
    TITLE_SIZE: int = 36
    H1_SIZE: int = 28
    H2_SIZE: int = 22
    H3_SIZE: int = 18
    BODY_SIZE: int = 11
    CAPTION_SIZE: int = 9

    # Spacing
    PAGE_MARGIN: int = 60  # pts
    SECTION_SPACING: int = 24  # pts
    PARAGRAPH_SPACING: int = 12  # pts

    # Chart/Visualization Settings
    CHART_DPI: int = 300
    CHART_STYLE: str = "seaborn-v0_8-darkgrid"
    CHART_COLOR_PALETTE: List[str] = None

    def __post_init__(self):
        """Initialize chart color palette."""
        if self.CHART_COLOR_PALETTE is None:
            self.CHART_COLOR_PALETTE = [
                self.ACCENT_COLOR,
                self.PRIMARY_COLOR,
                self.HIGHLIGHT_COLOR,
                "#f39c12",  # Orange
                "#27ae60",  # Green
                "#8e44ad",  # Purple
                "#3498db",  # Light Blue
                "#e74c3c",  # Red
            ]

    def get_css_styles(self) -> str:
        """Generate CSS for PDF styling."""
        return f"""
        @page {{
            size: Letter;
            margin: {self.PAGE_MARGIN}pt;
            @top-right {{
                content: "Confidential Business Plan";
                font-family: {self.BODY_FONT};
                font-size: {self.CAPTION_SIZE}pt;
                color: {self.LIGHT_TEXT};
            }}
            @bottom-center {{
                content: counter(page);
                font-family: {self.BODY_FONT};
                font-size: {self.CAPTION_SIZE}pt;
                color: {self.LIGHT_TEXT};
            }}
        }}

        body {{
            font-family: '{self.BODY_FONT}', sans-serif;
            font-size: {self.BODY_SIZE}pt;
            color: {self.TEXT_COLOR};
            line-height: 1.6;
            background-color: {self.BACKGROUND};
        }}

        h1 {{
            font-family: '{self.HEADER_FONT}', sans-serif;
            font-size: {self.H1_SIZE}pt;
            color: {self.PRIMARY_COLOR};
            font-weight: 700;
            margin-top: {self.SECTION_SPACING}pt;
            margin-bottom: {self.PARAGRAPH_SPACING}pt;
            border-bottom: 3px solid {self.ACCENT_COLOR};
            padding-bottom: 8pt;
        }}

        h2 {{
            font-family: '{self.HEADER_FONT}', sans-serif;
            font-size: {self.H2_SIZE}pt;
            color: {self.SECONDARY_COLOR};
            font-weight: 600;
            margin-top: {self.SECTION_SPACING - 6}pt;
            margin-bottom: {self.PARAGRAPH_SPACING - 2}pt;
        }}

        h3 {{
            font-family: '{self.HEADER_FONT}', sans-serif;
            font-size: {self.H3_SIZE}pt;
            color: {self.HIGHLIGHT_COLOR};
            font-weight: 600;
            margin-top: {self.PARAGRAPH_SPACING}pt;
            margin-bottom: {self.PARAGRAPH_SPACING - 4}pt;
        }}

        p {{
            margin-bottom: {self.PARAGRAPH_SPACING}pt;
            text-align: justify;
        }}

        .title-page {{
            text-align: center;
            padding-top: 150pt;
        }}

        .title {{
            font-family: '{self.HEADER_FONT}', sans-serif;
            font-size: {self.TITLE_SIZE}pt;
            color: {self.PRIMARY_COLOR};
            font-weight: 700;
            margin-bottom: 20pt;
        }}

        .subtitle {{
            font-family: '{self.ACCENT_FONT}', serif;
            font-size: {self.H2_SIZE}pt;
            color: {self.ACCENT_COLOR};
            font-style: italic;
            margin-bottom: 40pt;
        }}

        .section-divider {{
            page-break-before: always;
            border-top: 4px solid {self.ACCENT_COLOR};
            padding-top: {self.SECTION_SPACING}pt;
            margin-top: {self.SECTION_SPACING}pt;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: {self.PARAGRAPH_SPACING}pt 0;
            font-size: {self.BODY_SIZE - 1}pt;
        }}

        th {{
            background-color: {self.PRIMARY_COLOR};
            color: white;
            font-weight: 600;
            padding: 10pt;
            text-align: left;
            border: 1px solid {self.PRIMARY_COLOR};
        }}

        td {{
            padding: 8pt 10pt;
            border: 1px solid #dee2e6;
        }}

        tr:nth-child(even) {{
            background-color: {self.SECTION_BG};
        }}

        .highlight-box {{
            background-color: {self.SECTION_BG};
            border-left: 4px solid {self.ACCENT_COLOR};
            padding: 15pt;
            margin: {self.PARAGRAPH_SPACING}pt 0;
        }}

        .key-metric {{
            background: linear-gradient(135deg, {self.PRIMARY_COLOR}, {self.HIGHLIGHT_COLOR});
            color: white;
            padding: 20pt;
            border-radius: 8pt;
            margin: {self.PARAGRAPH_SPACING}pt 0;
            text-align: center;
        }}

        .metric-value {{
            font-size: {self.H1_SIZE}pt;
            font-weight: 700;
            font-family: '{self.HEADER_FONT}', sans-serif;
        }}

        .metric-label {{
            font-size: {self.BODY_SIZE}pt;
            margin-top: 5pt;
            opacity: 0.9;
        }}

        blockquote {{
            border-left: 4px solid {self.ACCENT_COLOR};
            padding-left: 20pt;
            margin: {self.PARAGRAPH_SPACING}pt 0;
            font-style: italic;
            color: {self.LIGHT_TEXT};
        }}

        ul, ol {{
            margin: {self.PARAGRAPH_SPACING}pt 0;
            padding-left: 25pt;
        }}

        li {{
            margin-bottom: 6pt;
        }}

        .chart-container {{
            margin: {self.SECTION_SPACING}pt 0;
            text-align: center;
        }}

        .chart-caption {{
            font-size: {self.CAPTION_SIZE}pt;
            color: {self.LIGHT_TEXT};
            font-style: italic;
            margin-top: 8pt;
        }}

        .executive-summary {{
            background-color: {self.SECTION_BG};
            padding: 20pt;
            border-radius: 4pt;
            margin: {self.SECTION_SPACING}pt 0;
        }}

        .footer-note {{
            font-size: {self.CAPTION_SIZE}pt;
            color: {self.LIGHT_TEXT};
            text-align: center;
            margin-top: {self.SECTION_SPACING}pt;
            padding-top: 10pt;
            border-top: 1px solid #dee2e6;
        }}
        """

    def get_matplotlib_config(self) -> Dict:
        """Get matplotlib configuration dict."""
        return {
            'figure.facecolor': 'white',
            'axes.facecolor': '#fafafa',
            'axes.edgecolor': self.PRIMARY_COLOR,
            'axes.labelcolor': self.TEXT_COLOR,
            'axes.titlesize': self.H3_SIZE,
            'axes.labelsize': self.BODY_SIZE,
            'xtick.color': self.TEXT_COLOR,
            'ytick.color': self.TEXT_COLOR,
            'grid.color': '#e0e0e0',
            'grid.linestyle': '--',
            'grid.alpha': 0.6,
            'font.family': 'sans-serif',
            'font.sans-serif': [self.BODY_FONT, 'DejaVu Sans'],
            'font.size': self.BODY_SIZE,
        }
