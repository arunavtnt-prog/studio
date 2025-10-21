"""
Input handling module for parsing application forms.
Supports CSV, JSON, and plain text formats.
"""

import csv
import json
import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field


@dataclass
class ApplicationData:
    """Structured application data."""

    # Personal Information
    full_name: str = ""
    email: str = ""
    career_milestones: str = ""
    personal_turning_points: str = ""

    # Venture Information
    venture_vision: str = ""
    target_industry: str = ""
    target_audience: str = ""
    demographic_profile: str = ""
    audience_pain_points: str = ""

    # Competitive Analysis
    competitive_differentiation: str = ""
    unique_value_proposition: str = ""
    competitors_monitored: str = ""

    # Audience Details
    target_demographic_age: str = ""
    audience_discovery_methods: str = ""
    audience_gender_profile: str = ""
    audience_marital_status: str = ""

    # Branding
    brand_image: str = ""
    brand_inspirations: str = ""
    branding_preferences: str = ""
    brand_emotions: str = ""
    brand_personality: str = ""
    brand_font_choice: str = ""
    brand_values: str = ""

    # Growth & Strategy
    scaling_goals: str = ""
    growth_strategy: str = ""
    brand_evolution_vision: str = ""

    # Additional Information
    other_info: str = ""
    deadlines_milestones: str = ""

    # Metadata
    raw_data: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            k: v for k, v in self.__dict__.items()
            if not k.startswith('_') and k != 'raw_data'
        }

    def validate(self) -> List[str]:
        """Validate required fields and return list of missing fields."""
        required = [
            'full_name', 'email', 'venture_vision',
            'target_industry', 'target_audience', 'unique_value_proposition'
        ]
        missing = [field for field in required if not getattr(self, field, '').strip()]
        return missing


class InputHandler:
    """Handles parsing of various input formats into structured data."""

    # Field name mappings for flexible parsing
    FIELD_MAPPINGS = {
        'full_name': ['full_name', 'name', 'your_full_name', 'creator_name'],
        'email': ['email', 'email_address', 'contact_email'],
        'career_milestones': ['career_milestones', 'career', 'professional_background'],
        'personal_turning_points': ['personal_turning_points', 'turning_points', 'key_moments'],
        'venture_vision': ['venture_vision', 'vision', 'business_vision', 'venture_idea'],
        'target_industry': ['target_industry', 'industry', 'niche', 'target_niche'],
        'target_audience': ['target_audience', 'audience', 'target_market'],
        'demographic_profile': ['demographic_profile', 'demographics', 'audience_demographics'],
        'audience_pain_points': ['audience_pain_points', 'pain_points', 'customer_problems'],
        'competitive_differentiation': ['competitive_differentiation', 'differentiation', 'how_different'],
        'unique_value_proposition': ['unique_value_proposition', 'value_proposition', 'uvp'],
        'competitors_monitored': ['competitors_monitored', 'competitors', 'competition'],
        'target_demographic_age': ['target_demographic_age', 'age_range', 'target_age'],
        'audience_discovery_methods': ['audience_discovery_methods', 'discovery_methods', 'how_find_audience'],
        'audience_gender_profile': ['audience_gender_profile', 'gender_profile', 'target_gender'],
        'audience_marital_status': ['audience_marital_status', 'marital_status'],
        'brand_image': ['brand_image', 'desired_brand_image', 'brand_perception'],
        'brand_inspirations': ['brand_inspirations', 'inspirations', 'brands_admired'],
        'branding_preferences': ['branding_preferences', 'brand_preferences', 'brand_style'],
        'brand_emotions': ['brand_emotions', 'emotions', 'brand_adjectives'],
        'brand_personality': ['brand_personality', 'personality', 'brand_character'],
        'brand_font_choice': ['brand_font_choice', 'font_choice', 'typography'],
        'brand_values': ['brand_values', 'values', 'brand_principles', 'core_values'],
        'scaling_goals': ['scaling_goals', 'goals', 'growth_targets'],
        'growth_strategy': ['growth_strategy', 'strategy', 'growth_channels'],
        'brand_evolution_vision': ['brand_evolution_vision', 'evolution', 'future_vision'],
        'other_info': ['other_info', 'additional_info', 'notes', 'other'],
        'deadlines_milestones': ['deadlines_milestones', 'deadlines', 'milestones', 'timeline'],
    }

    def __init__(self):
        """Initialize the input handler."""
        pass

    def parse_file(self, file_path: str) -> ApplicationData:
        """
        Parse input file based on extension.

        Args:
            file_path: Path to input file

        Returns:
            ApplicationData object

        Raises:
            ValueError: If file format is unsupported
        """
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        extension = path.suffix.lower()

        if extension == '.json':
            return self.parse_json(file_path)
        elif extension == '.csv':
            return self.parse_csv(file_path)
        elif extension in ['.txt', '.text']:
            return self.parse_text(file_path)
        else:
            raise ValueError(f"Unsupported file format: {extension}")

    def parse_json(self, file_path: str) -> ApplicationData:
        """Parse JSON input file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return self._map_to_application_data(data)

    def parse_csv(self, file_path: str) -> ApplicationData:
        """Parse CSV input file (assumes single row or key-value pairs)."""
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

            if not rows:
                raise ValueError("CSV file is empty")

            # Use first row of data
            data = rows[0]

        return self._map_to_application_data(data)

    def parse_text(self, file_path: str) -> ApplicationData:
        """
        Parse plain text file with key-value pairs.
        Format: "Field Name: Value" or "Field Name\nValue"
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        data = self._extract_key_value_pairs(content)
        return self._map_to_application_data(data)

    def parse_dict(self, data: Dict[str, Any]) -> ApplicationData:
        """Parse dictionary directly."""
        return self._map_to_application_data(data)

    def _extract_key_value_pairs(self, text: str) -> Dict[str, str]:
        """Extract key-value pairs from text using pattern matching."""
        data = {}

        # Try pattern: "Key: Value"
        pattern1 = re.compile(r'^(.+?):\s*(.+?)$', re.MULTILINE)
        matches = pattern1.findall(text)

        for key, value in matches:
            key = key.strip()
            value = value.strip()
            if key and value:
                data[key] = value

        # If no matches, try section-based parsing
        if not data:
            sections = re.split(r'\n\s*\n', text)
            for section in sections:
                lines = section.strip().split('\n', 1)
                if len(lines) == 2:
                    key, value = lines
                    data[key.strip()] = value.strip()

        return data

    def _map_to_application_data(self, data: Dict[str, Any]) -> ApplicationData:
        """Map input dictionary to ApplicationData using field mappings."""
        app_data = ApplicationData()
        app_data.raw_data = data.copy()

        # Normalize keys (lowercase, replace spaces/dashes with underscores)
        normalized_data = {
            self._normalize_key(k): str(v) if v is not None else ""
            for k, v in data.items()
        }

        # Map fields using field mappings
        for target_field, possible_names in self.FIELD_MAPPINGS.items():
            for name in possible_names:
                normalized_name = self._normalize_key(name)
                if normalized_name in normalized_data:
                    setattr(app_data, target_field, normalized_data[normalized_name])
                    break

        return app_data

    @staticmethod
    def _normalize_key(key: str) -> str:
        """Normalize key for matching (lowercase, underscores)."""
        return re.sub(r'[^\w]', '_', key.lower()).strip('_')

    def validate_data(self, data: ApplicationData) -> tuple[bool, List[str]]:
        """
        Validate application data.

        Returns:
            Tuple of (is_valid, missing_fields)
        """
        missing = data.validate()
        return len(missing) == 0, missing
