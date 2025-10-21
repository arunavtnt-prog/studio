"""
AI-powered content generation for business plans.
Supports both OpenAI and Anthropic APIs.
"""

import os
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from .input_handler import ApplicationData
from config.settings import Settings


@dataclass
class SectionContent:
    """Generated content for a business plan section."""
    title: str
    content: str
    word_count: int
    subsections: Optional[Dict[str, str]] = None


class ContentGenerator:
    """Generates business plan content using AI APIs."""

    def __init__(self, settings: Settings):
        """
        Initialize content generator.

        Args:
            settings: Application settings
        """
        self.settings = settings
        self.settings.validate_api_keys()

        # Initialize the appropriate client
        if settings.AI_PROVIDER == "openai":
            import openai
            self.client = openai.OpenAI(api_key=settings.get_api_key())
            self.provider = "openai"
        elif settings.AI_PROVIDER == "anthropic":
            import anthropic
            self.client = anthropic.Anthropic(api_key=settings.get_api_key())
            self.provider = "anthropic"
        else:
            raise ValueError(f"Unsupported AI provider: {settings.AI_PROVIDER}")

    def generate_complete_business_plan(
        self,
        data: ApplicationData
    ) -> Dict[str, SectionContent]:
        """
        Generate complete business plan with all sections.

        Args:
            data: Application data

        Returns:
            Dictionary mapping section names to content
        """
        print("Generating business plan content...")
        sections = {}

        for i, section_name in enumerate(self.settings.SECTIONS, 1):
            print(f"[{i}/{len(self.settings.SECTIONS)}] Generating: {section_name}")

            try:
                content = self._generate_section(section_name, data, sections)
                sections[section_name] = content
                print(f"  ✓ Generated {content.word_count} words")

                # Rate limiting
                time.sleep(1)

            except Exception as e:
                print(f"  ✗ Error generating {section_name}: {e}")
                # Create placeholder content
                sections[section_name] = SectionContent(
                    title=section_name,
                    content=f"[Content generation failed for {section_name}]",
                    word_count=0
                )

        return sections

    def _generate_section(
        self,
        section_name: str,
        data: ApplicationData,
        previous_sections: Dict[str, SectionContent]
    ) -> SectionContent:
        """Generate content for a specific section."""
        prompt = self._build_section_prompt(section_name, data, previous_sections)

        # Call the appropriate API
        if self.provider == "openai":
            content_text = self._call_openai(prompt)
        else:
            content_text = self._call_anthropic(prompt)

        word_count = len(content_text.split())

        return SectionContent(
            title=section_name,
            content=content_text.strip(),
            word_count=word_count
        )

    def _build_section_prompt(
        self,
        section_name: str,
        data: ApplicationData,
        previous_sections: Dict[str, SectionContent]
    ) -> str:
        """Build prompt for generating section content."""
        context = self._build_context_from_data(data)

        # Previous content for coherence
        previous_context = ""
        if previous_sections:
            prev_summaries = []
            for name, content in list(previous_sections.items())[-3:]:
                summary = content.content[:300] + "..." if len(content.content) > 300 else content.content
                prev_summaries.append(f"{name}: {summary}")
            previous_context = "\n\n".join(prev_summaries)

        section_prompts = {
            "Executive Summary": f"""
Write a compelling 500-word executive summary for this business plan. This is for an NYC-based brand accelerator.

Include:
- Business vision and mission (2-3 sentences)
- Market opportunity and target audience
- Unique value proposition
- Key competitive advantages
- Growth strategy overview
- Financial highlights (projected revenue trajectory)

Make it investor-ready, data-driven, and compelling.
""",
            "Vision & Mission": f"""
Write a detailed Vision & Mission section (800-1000 words).

Include:
- Long-term vision statement
- Core mission statement
- Purpose and impact
- Values alignment
- How this venture will transform the industry
- The legacy being built

Be inspirational yet grounded in business strategy.
""",
            "Founder Story & Background": f"""
Write an engaging Founder Story section (1000-1200 words) based on:
- Career milestones: {data.career_milestones}
- Personal turning points: {data.personal_turning_points}

Structure:
1. Professional background and expertise
2. Key experiences that led to this venture
3. Unique insights from journey
4. Why this founder is uniquely positioned to succeed
5. Credibility markers and achievements

Make it personal, authentic, and credible.
""",
            "Market Analysis & Opportunity": f"""
Write a comprehensive Market Analysis section (1500-2000 words).

Cover:
1. Industry Overview
   - Current market size for {data.target_industry}
   - Growth trends and projections
   - Key market drivers

2. Market Opportunity
   - Addressable market size (TAM, SAM, SOM framework)
   - Market gaps and inefficiencies
   - Timing and why now

3. Industry Trends
   - Emerging trends benefiting this venture
   - Consumer behavior shifts
   - Technology and innovation impacts

Use specific data points, cite industry reports, and be analytical.
""",
            "Target Audience & Customer Persona": f"""
Create detailed Target Audience analysis (1200-1500 words) for:
- Primary audience: {data.target_audience}
- Demographics: {data.demographic_profile}
- Age range: {data.target_demographic_age}
- Gender: {data.audience_gender_profile}
- Marital status: {data.audience_marital_status}

Include:
1. Detailed customer personas (2-3 personas)
2. Psychographic profiles
3. Pain points: {data.audience_pain_points}
4. Needs and desires
5. Buying behaviors and decision factors
6. Media consumption habits
7. Discovery methods: {data.audience_discovery_methods}

Make personas vivid and actionable.
""",
            "Competitive Landscape": f"""
Write comprehensive Competitive Analysis (1200-1500 words).

Competitors being monitored: {data.competitors_monitored}

Cover:
1. Direct competitors analysis (3-5 companies)
2. Indirect competitors
3. Competitive matrix (positioning, pricing, features, weaknesses)
4. Market share distribution
5. Competitive advantages we have
6. Barriers to entry
7. Differentiation strategy: {data.competitive_differentiation}

Be specific, analytical, and strategic.
""",
            "Unique Value Proposition": f"""
Develop a powerful UVP section (800-1000 words) based on:
{data.unique_value_proposition}

Structure:
1. Core value proposition statement
2. Specific benefits delivered
3. Why alternatives fall short
4. Proof points and validation
5. Sustainable competitive advantages
6. Differentiation: {data.competitive_differentiation}

Make it clear, compelling, and defensible.
""",
            "Brand Strategy & Identity": f"""
Create comprehensive Brand Strategy (1500-2000 words) using:
- Brand image: {data.brand_image}
- Inspirations: {data.brand_inspirations}
- Preferences: {data.branding_preferences}
- Emotions: {data.brand_emotions}
- Personality: {data.brand_personality}
- Font choice: {data.brand_font_choice}
- Values: {data.brand_values}

Include:
1. Brand positioning and architecture
2. Brand personality and voice
3. Visual identity direction
4. Brand values and principles
5. Emotional connection strategy
6. Brand storytelling approach
7. Evolution vision: {data.brand_evolution_vision}

Be specific about brand execution and consistency.
""",
            "Product & Service Offering": f"""
Write detailed Product/Service section (1200-1500 words).

Include:
1. Core offerings description
2. Product/service features and benefits
3. Development roadmap
4. Innovation and IP
5. Quality and delivery
6. Pricing strategy
7. Product-market fit validation

Be specific about what's being sold and how it delivers value.
""",
            "Go-to-Market Strategy": f"""
Develop comprehensive GTM strategy (1500-2000 words).

Cover:
1. Launch strategy and phases
2. Customer acquisition approach
3. Sales strategy and channels
4. Distribution model
5. Partnerships and alliances
6. Pilot programs and testing
7. Scaling playbook
8. Growth strategy: {data.growth_strategy}

Be tactical and execution-focused.
""",
            "Marketing & Growth Channels": f"""
Create detailed Marketing plan (1500-2000 words) covering:
- Growth strategy: {data.growth_strategy}
- Scaling goals: {data.scaling_goals}

Include:
1. Channel strategy (digital, social, content, PR, events, partnerships)
2. Customer acquisition strategy
3. Content and storytelling approach
4. Community building
5. Influencer and partnership marketing
6. Performance metrics and KPIs
7. Budget allocation by channel
8. Retention and lifecycle marketing

Be specific about tactics and expected ROI.
""",
            "Operations & Infrastructure": f"""
Write Operations section (1000-1200 words).

Cover:
1. Operational model and workflow
2. Technology infrastructure
3. Team structure and roles
4. Key processes and systems
5. Vendor and supplier relationships
6. Quality control
7. Scalability considerations

Be practical and implementable.
""",
            "Financial Projections": f"""
Create Financial Projections section (1500-2000 words).

Include:
1. Revenue model and streams
2. Unit economics
3. 3-year financial projections
   - Year 1: Monthly breakdown
   - Years 2-3: Quarterly
4. Cost structure and margins
5. Break-even analysis
6. Funding requirements and use of funds
7. Key assumptions
8. Exit potential and multiples

Use realistic numbers and show clear path to profitability.
""",
            "Milestones & Roadmap": f"""
Develop detailed Roadmap (1000-1200 words) incorporating:
{data.deadlines_milestones}

Include:
1. 12-month detailed milestones
2. 3-year strategic milestones
3. Key metrics to track
4. Resource requirements by phase
5. Risk mitigation timeline
6. Success criteria

Make it actionable with clear dates and deliverables.
""",
            "Team & Advisors": f"""
Write Team section (800-1000 words).

Cover:
1. Founder/leadership team
2. Key hires needed (with timeline)
3. Advisors and board
4. Organizational structure
5. Culture and values
6. Talent acquisition strategy

Show the team's ability to execute.
""",
            "Risk Analysis & Mitigation": f"""
Create Risk Analysis (1000-1200 words).

Cover:
1. Market risks
2. Competitive risks
3. Operational risks
4. Financial risks
5. Regulatory/legal risks
6. Mitigation strategies for each
7. Contingency plans

Be honest and show strategic thinking.
""",
            "Appendices": f"""
Create Appendices section with:
1. Additional market research data
2. Detailed financial models
3. Customer research findings
4. Partnership letters of intent
5. Product mockups/wireframes
6. Team bios and credentials

Summarize what would be included (500-800 words).
"""
        }

        base_prompt = section_prompts.get(section_name, f"""
Write a detailed {section_name} section for this business plan (minimum {self.settings.SECTION_MIN_WORDS} words).
Be comprehensive, professional, and investor-ready.
""")

        full_prompt = f"""You are writing a premium business plan for an NYC-based brand accelerator.

TARGET WORD COUNT: Minimum {self.settings.SECTION_MIN_WORDS} words for this section.

CREATOR INFORMATION:
{context}

{f"PREVIOUS SECTIONS CONTEXT (for coherence):{chr(10)}{previous_context}{chr(10)}" if previous_context else ""}

SECTION TO WRITE: {section_name}

{base_prompt}

INSTRUCTIONS:
- Write in a professional, compelling tone suitable for investors and VCs
- Include specific details from the creator's application
- Use data and metrics where possible
- Structure with clear subsections and headers
- Make it actionable and strategic
- Maintain consistency with previous sections
- Focus on NYC/US market context
- Write for a premium, top-tier accelerator audience

Begin the section content now:
"""

        return full_prompt

    def _build_context_from_data(self, data: ApplicationData) -> str:
        """Build context string from application data."""
        context_parts = []

        if data.full_name:
            context_parts.append(f"Founder: {data.full_name}")
        if data.venture_vision:
            context_parts.append(f"Venture Vision: {data.venture_vision}")
        if data.target_industry:
            context_parts.append(f"Industry: {data.target_industry}")
        if data.target_audience:
            context_parts.append(f"Target Audience: {data.target_audience}")
        if data.unique_value_proposition:
            context_parts.append(f"Value Proposition: {data.unique_value_proposition}")

        # Add all other non-empty fields
        for key, value in data.to_dict().items():
            if value and value.strip() and key not in [
                'full_name', 'venture_vision', 'target_industry',
                'target_audience', 'unique_value_proposition'
            ]:
                field_name = key.replace('_', ' ').title()
                context_parts.append(f"{field_name}: {value}")

        return "\n".join(context_parts)

    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API."""
        response = self.client.chat.completions.create(
            model=self.settings.get_model_name(),
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert business plan writer specializing in premium, investor-ready documents for NYC-based startups and brand ventures."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=self.settings.MAX_TOKENS,
            temperature=self.settings.TEMPERATURE
        )

        return response.choices[0].message.content

    def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic API."""
        message = self.client.messages.create(
            model=self.settings.get_model_name(),
            max_tokens=self.settings.MAX_TOKENS,
            temperature=self.settings.TEMPERATURE,
            system="You are an expert business plan writer specializing in premium, investor-ready documents for NYC-based startups and brand ventures.",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return message.content[0].text

    def generate_executive_summary(self, data: ApplicationData) -> str:
        """Generate standalone executive summary."""
        prompt = f"""Write a compelling 500-word executive summary for this business venture:

Founder: {data.full_name}
Vision: {data.venture_vision}
Industry: {data.target_industry}
Target Audience: {data.target_audience}
Value Proposition: {data.unique_value_proposition}
Differentiation: {data.competitive_differentiation}

Make it investor-ready, highlighting the opportunity, solution, market, traction, and ask.
"""

        if self.provider == "openai":
            return self._call_openai(prompt)
        else:
            return self._call_anthropic(prompt)
