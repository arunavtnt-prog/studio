#!/usr/bin/env python3
"""
Business Plan Generator - Main CLI Application

An AI-powered business plan generation system for NYC-based brand accelerators.
Generates comprehensive, investor-ready business plans with professional branding.
"""

import argparse
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from config.settings import Settings
from src.orchestrator import BusinessPlanOrchestrator


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Generate professional business plans from application forms",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate full business plan (Markdown + PDF)
  python main.py input.json

  # Generate only Markdown
  python main.py input.csv --no-pdf

  # Generate with pitch deck
  python main.py input.txt --pitch-deck

  # Generate only executive summary
  python main.py input.json --summary-only

  # Validate environment
  python main.py --validate

Supported input formats: .json, .csv, .txt
"""
    )

    parser.add_argument(
        'input_file',
        nargs='?',
        help='Path to input file (JSON, CSV, or TXT format)'
    )

    parser.add_argument(
        '--no-pdf',
        action='store_true',
        help='Skip PDF generation (only create Markdown)'
    )

    parser.add_argument(
        '--pitch-deck',
        action='store_true',
        help='Also generate a pitch deck PDF'
    )

    parser.add_argument(
        '--summary-only',
        action='store_true',
        help='Generate only executive summary (faster)'
    )

    parser.add_argument(
        '--validate',
        action='store_true',
        help='Validate environment and dependencies'
    )

    parser.add_argument(
        '--ai-provider',
        choices=['openai', 'anthropic'],
        help='AI provider to use (default: from settings or env)'
    )

    parser.add_argument(
        '--output-dir',
        help='Output directory for generated files (default: output/)'
    )

    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Suppress progress messages'
    )

    parser.add_argument(
        '--version',
        action='version',
        version='Business Plan Generator v1.0.0'
    )

    args = parser.parse_args()

    # Handle validation mode
    if args.validate:
        orchestrator = BusinessPlanOrchestrator()
        is_valid = orchestrator.validate_environment()
        sys.exit(0 if is_valid else 1)

    # Require input file for generation
    if not args.input_file:
        parser.print_help()
        print("\n❌ Error: input_file is required (or use --validate)")
        sys.exit(1)

    # Check input file exists
    if not Path(args.input_file).exists():
        print(f"❌ Error: Input file not found: {args.input_file}")
        sys.exit(1)

    # Create settings
    settings = Settings()

    # Override settings from args
    if args.ai_provider:
        settings.AI_PROVIDER = args.ai_provider

    if args.output_dir:
        settings.OUTPUT_DIR = args.output_dir
        settings.CHART_OUTPUT_DIR = str(Path(args.output_dir) / "charts")

    # Create orchestrator
    orchestrator = BusinessPlanOrchestrator(settings)

    # Validate environment before proceeding
    if not orchestrator.validate_environment():
        print("\n❌ Environment validation failed. Please fix issues above.")
        sys.exit(1)

    # Run generation
    try:
        if args.summary_only:
            # Generate only executive summary
            results = orchestrator.generate_executive_summary_only(
                input_path=args.input_file,
                verbose=not args.quiet
            )
        else:
            # Generate full business plan
            results = orchestrator.generate_business_plan(
                input_path=args.input_file,
                generate_pdf=not args.no_pdf,
                generate_pitch_deck=args.pitch_deck,
                verbose=not args.quiet
            )

        sys.exit(0)

    except KeyboardInterrupt:
        print("\n\n⚠️  Generation interrupted by user")
        sys.exit(1)

    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        if not args.quiet:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
