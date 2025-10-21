"""
Orchestrator module that coordinates the entire business plan generation workflow.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Optional

from config.settings import Settings
from config.branding import BrandingConfig
from .input_handler import InputHandler, ApplicationData
from .content_generator import ContentGenerator
from .visualizer import DataVisualizer
from .markdown_generator import MarkdownGenerator
from .pdf_generator import PDFGenerator


class BusinessPlanOrchestrator:
    """Coordinates the end-to-end business plan generation process."""

    def __init__(self, settings: Optional[Settings] = None):
        """
        Initialize orchestrator.

        Args:
            settings: Application settings (uses defaults if not provided)
        """
        self.settings = settings or Settings()
        self.branding = BrandingConfig()

        # Initialize components
        self.input_handler = InputHandler()
        self.content_generator = ContentGenerator(self.settings)
        self.visualizer = DataVisualizer(
            output_dir=self.settings.CHART_OUTPUT_DIR,
            branding=self.branding
        )
        self.markdown_generator = MarkdownGenerator(
            output_dir=self.settings.OUTPUT_DIR
        )
        self.pdf_generator = PDFGenerator(
            branding=self.branding,
            output_dir=self.settings.OUTPUT_DIR
        )

    def generate_business_plan(
        self,
        input_path: str,
        generate_pdf: bool = True,
        generate_pitch_deck: bool = False,
        verbose: bool = True
    ) -> Dict[str, str]:
        """
        Generate complete business plan from input file.

        Args:
            input_path: Path to input file (JSON, CSV, or TXT)
            generate_pdf: Whether to generate PDF output
            generate_pitch_deck: Whether to generate pitch deck PDF
            verbose: Print progress messages

        Returns:
            Dictionary with paths to generated files
        """
        results = {}

        try:
            # Step 1: Parse input
            if verbose:
                print(f"\n{'='*60}")
                print("BUSINESS PLAN GENERATOR")
                print(f"{'='*60}\n")
                print(f"[1/6] Parsing input file: {input_path}")

            data = self.input_handler.parse_file(input_path)

            # Validate data
            is_valid, missing_fields = self.input_handler.validate_data(data)
            if not is_valid:
                print(f"\n⚠️  Warning: Missing required fields: {', '.join(missing_fields)}")
                print("Proceeding with available data...\n")

            creator_name = data.full_name or "creator"
            if verbose:
                print(f"  ✓ Parsed data for: {creator_name}\n")

            # Step 2: Generate content
            if verbose:
                print("[2/6] Generating business plan content using AI...")
                print("  This may take several minutes...\n")

            sections = self.content_generator.generate_complete_business_plan(data)

            total_words = sum(s.word_count for s in sections.values())
            if verbose:
                print(f"\n  ✓ Generated {len(sections)} sections ({total_words:,} words)\n")

            # Step 3: Generate visualizations
            if verbose:
                print("[3/6] Creating data visualizations...")

            charts = self.visualizer.generate_all_charts(data, creator_name)

            if verbose:
                print(f"  ✓ Created {len(charts)} charts\n")

            # Step 4: Generate Markdown
            if verbose:
                print("[4/6] Generating Markdown document...")

            markdown_path = self.markdown_generator.generate_business_plan(
                data=data,
                sections=sections,
                charts=charts,
                creator_name=creator_name
            )
            results['markdown'] = markdown_path

            if verbose:
                print()

            # Step 5: Generate PDF
            if generate_pdf:
                if verbose:
                    print("[5/6] Generating branded PDF...")

                try:
                    pdf_path = self.pdf_generator.generate_pdf_from_markdown(
                        markdown_path=markdown_path,
                        data=data,
                        creator_name=creator_name
                    )
                    results['pdf'] = pdf_path

                    if verbose:
                        print()

                except Exception as e:
                    print(f"  ✗ PDF generation failed: {e}")
                    print("  Markdown output is still available.\n")
            else:
                if verbose:
                    print("[5/6] Skipping PDF generation\n")

            # Step 6: Generate pitch deck (optional)
            if generate_pitch_deck:
                if verbose:
                    print("[6/6] Generating pitch deck PDF...")

                try:
                    pitch_deck_path = self.pdf_generator.create_pitch_deck_pdf(
                        data=data,
                        sections=sections,
                        charts=charts,
                        creator_name=creator_name
                    )
                    results['pitch_deck'] = pitch_deck_path

                    if verbose:
                        print()

                except Exception as e:
                    print(f"  ✗ Pitch deck generation failed: {e}\n")
            else:
                if verbose:
                    print("[6/6] Skipping pitch deck generation\n")

            # Summary
            if verbose:
                self._print_summary(results, data, total_words, len(charts))

            return results

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

    def generate_executive_summary_only(
        self,
        input_path: str,
        verbose: bool = True
    ) -> Dict[str, str]:
        """
        Generate only executive summary (faster, for quick previews).

        Args:
            input_path: Path to input file
            verbose: Print progress messages

        Returns:
            Dictionary with path to generated summary
        """
        results = {}

        if verbose:
            print("\n[1/2] Parsing input...")

        data = self.input_handler.parse_file(input_path)
        creator_name = data.full_name or "creator"

        if verbose:
            print("[2/2] Generating executive summary...")

        summary = self.content_generator.generate_executive_summary(data)

        summary_path = self.markdown_generator.generate_executive_summary_only(
            data=data,
            summary_content=summary,
            creator_name=creator_name
        )

        results['executive_summary'] = summary_path

        if verbose:
            print(f"\n✅ Executive summary saved to: {summary_path}\n")

        return results

    def _print_summary(
        self,
        results: Dict[str, str],
        data: ApplicationData,
        word_count: int,
        chart_count: int
    ):
        """Print summary of generated outputs."""
        print(f"{'='*60}")
        print("GENERATION COMPLETE")
        print(f"{'='*60}\n")

        print(f"Creator: {data.full_name}")
        print(f"Venture: {data.venture_vision}")
        print(f"Industry: {data.target_industry}\n")

        print(f"Content Statistics:")
        print(f"  • Total words: {word_count:,}")
        print(f"  • Pages (estimated): {word_count // 500}")
        print(f"  • Charts generated: {chart_count}\n")

        print(f"Output Files:")
        for output_type, path in results.items():
            file_size = Path(path).stat().st_size / 1024  # KB
            print(f"  • {output_type.title()}: {path}")
            print(f"    ({file_size:.1f} KB)")

        print(f"\n{'='*60}\n")

    def validate_environment(self) -> bool:
        """
        Validate that all required dependencies and API keys are configured.

        Returns:
            True if environment is valid
        """
        issues = []

        # Check API keys
        try:
            self.settings.validate_api_keys()
        except ValueError as e:
            issues.append(str(e))

        # Check for WeasyPrint
        try:
            import weasyprint
        except ImportError:
            issues.append(
                "WeasyPrint not installed. PDF generation will not be available.\n"
                "Install with: pip install weasyprint"
            )

        # Check for matplotlib
        try:
            import matplotlib
        except ImportError:
            issues.append(
                "Matplotlib not installed. Visualization will not be available.\n"
                "Install with: pip install matplotlib"
            )

        # Check for markdown
        try:
            import markdown
        except ImportError:
            issues.append(
                "Markdown library not installed.\n"
                "Install with: pip install markdown"
            )

        # Check for AI client libraries
        if self.settings.AI_PROVIDER == "openai":
            try:
                import openai
            except ImportError:
                issues.append(
                    "OpenAI library not installed.\n"
                    "Install with: pip install openai"
                )
        elif self.settings.AI_PROVIDER == "anthropic":
            try:
                import anthropic
            except ImportError:
                issues.append(
                    "Anthropic library not installed.\n"
                    "Install with: pip install anthropic"
                )

        if issues:
            print("\n⚠️  Environment Issues Detected:\n")
            for issue in issues:
                print(f"  • {issue}\n")
            return False

        print("✅ Environment validation passed!\n")
        return True
