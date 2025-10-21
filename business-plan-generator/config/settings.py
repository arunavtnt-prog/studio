"""
Application settings and configuration.
"""

import os
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class Settings:
    """Application-wide settings."""

    # API Configuration
    OPENAI_API_KEY: Optional[str] = field(
        default_factory=lambda: os.getenv("OPENAI_API_KEY")
    )
    ANTHROPIC_API_KEY: Optional[str] = field(
        default_factory=lambda: os.getenv("ANTHROPIC_API_KEY")
    )

    # AI Model Settings
    AI_PROVIDER: str = "anthropic"  # "openai" or "anthropic"
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    MAX_TOKENS: int = 4096
    TEMPERATURE: float = 0.7

    # Content Generation Settings
    TARGET_PAGE_COUNT: int = 50
    WORDS_PER_PAGE: int = 500
    EXECUTIVE_SUMMARY_WORDS: int = 500
    SECTION_MIN_WORDS: int = 800

    # Visualization Settings
    CHART_OUTPUT_DIR: str = "output/charts"
    CHART_FORMAT: str = "png"
    CHART_DPI: int = 300

    # Output Settings
    OUTPUT_DIR: str = "output"
    MARKDOWN_TEMPLATE: str = "templates/business_plan_template.md"

    # Document Sections (in order)
    SECTIONS: List[str] = field(default_factory=lambda: [
        "Executive Summary",
        "Vision & Mission",
        "Founder Story & Background",
        "Market Analysis & Opportunity",
        "Target Audience & Customer Persona",
        "Competitive Landscape",
        "Unique Value Proposition",
        "Brand Strategy & Identity",
        "Product & Service Offering",
        "Go-to-Market Strategy",
        "Marketing & Growth Channels",
        "Operations & Infrastructure",
        "Financial Projections",
        "Milestones & Roadmap",
        "Team & Advisors",
        "Risk Analysis & Mitigation",
        "Appendices"
    ])

    # Field Mappings
    REQUIRED_FIELDS: List[str] = field(default_factory=lambda: [
        "full_name",
        "email",
        "venture_vision",
        "target_industry",
        "target_audience",
        "unique_value_proposition"
    ])

    def __post_init__(self):
        """Validate settings and create directories."""
        # Create output directories
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
        os.makedirs(self.CHART_OUTPUT_DIR, exist_ok=True)

    def validate_api_keys(self) -> bool:
        """Check if required API keys are configured."""
        if self.AI_PROVIDER == "openai" and not self.OPENAI_API_KEY:
            raise ValueError(
                "OPENAI_API_KEY not found. Set it as environment variable."
            )
        elif self.AI_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
            raise ValueError(
                "ANTHROPIC_API_KEY not found. Set it as environment variable."
            )
        return True

    def get_api_key(self) -> str:
        """Get the appropriate API key based on provider."""
        if self.AI_PROVIDER == "openai":
            return self.OPENAI_API_KEY
        elif self.AI_PROVIDER == "anthropic":
            return self.ANTHROPIC_API_KEY
        else:
            raise ValueError(f"Unknown AI provider: {self.AI_PROVIDER}")

    def get_model_name(self) -> str:
        """Get the model name based on provider."""
        if self.AI_PROVIDER == "openai":
            return self.OPENAI_MODEL
        elif self.AI_PROVIDER == "anthropic":
            return self.ANTHROPIC_MODEL
        else:
            raise ValueError(f"Unknown AI provider: {self.AI_PROVIDER}")
