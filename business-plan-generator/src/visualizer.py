"""
Data visualization module for business plan charts and graphs.
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Tuple
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from datetime import datetime, timedelta

from config.branding import BrandingConfig
from .input_handler import ApplicationData


class DataVisualizer:
    """Generate charts and visualizations for business plans."""

    def __init__(self, output_dir: str = "output/charts", branding: BrandingConfig = None):
        """
        Initialize visualizer.

        Args:
            output_dir: Directory to save charts
            branding: Branding configuration
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.branding = branding or BrandingConfig()

        # Apply matplotlib configuration
        plt.rcParams.update(self.branding.get_matplotlib_config())

    def generate_all_charts(self, data: ApplicationData, creator_name: str) -> Dict[str, str]:
        """
        Generate all charts for the business plan.

        Args:
            data: Application data
            creator_name: Creator name for file naming

        Returns:
            Dictionary mapping chart names to file paths
        """
        charts = {}

        print("Generating visualizations...")

        try:
            charts['market_sizing'] = self.create_market_sizing_chart(creator_name)
            print("  ✓ Market sizing chart")
        except Exception as e:
            print(f"  ✗ Market sizing: {e}")

        try:
            charts['audience_demographics'] = self.create_audience_demographics(
                data, creator_name
            )
            print("  ✓ Audience demographics")
        except Exception as e:
            print(f"  ✗ Audience demographics: {e}")

        try:
            charts['competitive_matrix'] = self.create_competitive_matrix(
                data, creator_name
            )
            print("  ✓ Competitive landscape")
        except Exception as e:
            print(f"  ✗ Competitive matrix: {e}")

        try:
            charts['revenue_projections'] = self.create_revenue_projections(creator_name)
            print("  ✓ Revenue projections")
        except Exception as e:
            print(f"  ✗ Revenue projections: {e}")

        try:
            charts['milestone_timeline'] = self.create_milestone_timeline(
                data, creator_name
            )
            print("  ✓ Milestone timeline")
        except Exception as e:
            print(f"  ✗ Milestone timeline: {e}")

        try:
            charts['customer_acquisition'] = self.create_customer_acquisition_funnel(
                creator_name
            )
            print("  ✓ Customer acquisition funnel")
        except Exception as e:
            print(f"  ✗ Customer acquisition: {e}")

        try:
            charts['market_share'] = self.create_market_share_chart(creator_name)
            print("  ✓ Market share projection")
        except Exception as e:
            print(f"  ✗ Market share: {e}")

        return charts

    def create_market_sizing_chart(self, creator_name: str) -> str:
        """Create TAM/SAM/SOM market sizing visualization."""
        fig, ax = plt.subplots(figsize=(10, 8))

        # Sample data (would be calculated from actual market research)
        markets = ['TAM\n(Total Addressable\nMarket)',
                   'SAM\n(Serviceable\nAddressable Market)',
                   'SOM\n(Serviceable\nObtainable Market)']
        sizes = [500, 150, 25]  # in millions
        colors = [self.branding.CHART_COLOR_PALETTE[0],
                  self.branding.CHART_COLOR_PALETTE[1],
                  self.branding.CHART_COLOR_PALETTE[2]]

        # Create nested circles
        max_size = max(sizes)
        for i, (market, size, color) in enumerate(zip(markets, sizes, colors)):
            circle = plt.Circle((0.5, 0.5), (size / max_size) * 0.4,
                               color=color, alpha=0.7, label=market)
            ax.add_patch(circle)

            # Add labels with values
            y_offset = 0.5 + (i * 0.08 - 0.08)
            ax.text(0.5, y_offset, f'{market}\n${size}M',
                   ha='center', va='center', fontsize=11, fontweight='bold',
                   color='white' if i < 2 else self.branding.TEXT_COLOR)

        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal')
        ax.axis('off')

        plt.title('Market Opportunity Sizing',
                 fontsize=16, fontweight='bold',
                 color=self.branding.PRIMARY_COLOR, pad=20)

        filename = f"{creator_name}_market_sizing.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)

    def create_audience_demographics(self, data: ApplicationData, creator_name: str) -> str:
        """Create audience demographic breakdown."""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

        # Age distribution
        age_ranges = ['18-24', '25-34', '35-44', '45-54', '55+']
        age_percentages = [15, 35, 30, 15, 5]  # Sample data

        ax1.bar(age_ranges, age_percentages,
               color=self.branding.CHART_COLOR_PALETTE[0], alpha=0.8)
        ax1.set_title('Age Distribution', fontsize=14, fontweight='bold',
                     color=self.branding.PRIMARY_COLOR)
        ax1.set_ylabel('Percentage (%)', fontsize=11)
        ax1.set_xlabel('Age Range', fontsize=11)
        ax1.grid(axis='y', alpha=0.3)

        # Add value labels on bars
        for i, v in enumerate(age_percentages):
            ax1.text(i, v + 1, f'{v}%', ha='center', va='bottom', fontweight='bold')

        # Gender/Marital Status (if available)
        categories = ['Female\nSingle', 'Female\nMarried', 'Male\nSingle', 'Male\nMarried']
        values = [30, 25, 25, 20]  # Sample data

        colors = [self.branding.CHART_COLOR_PALETTE[i] for i in range(len(categories))]
        wedges, texts, autotexts = ax2.pie(values, labels=categories, autopct='%1.1f%%',
                                           colors=colors, startangle=90)

        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')

        ax2.set_title('Demographic Breakdown', fontsize=14, fontweight='bold',
                     color=self.branding.PRIMARY_COLOR)

        plt.suptitle('Target Audience Demographics',
                    fontsize=16, fontweight='bold', y=1.02)

        filename = f"{creator_name}_audience_demographics.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)

    def create_competitive_matrix(self, data: ApplicationData, creator_name: str) -> str:
        """Create competitive positioning matrix."""
        fig, ax = plt.subplots(figsize=(10, 8))

        # Sample competitive data (would be derived from competitive analysis)
        competitors = [
            ('Our Brand', 8.5, 8.0, 150),
            ('Competitor A', 6.0, 9.0, 200),
            ('Competitor B', 7.5, 6.0, 180),
            ('Competitor C', 5.0, 7.0, 120),
            ('Competitor D', 9.0, 5.0, 160),
        ]

        for i, (name, quality, price, size) in enumerate(competitors):
            color = self.branding.ACCENT_COLOR if i == 0 else self.branding.CHART_COLOR_PALETTE[i]
            marker = 's' if i == 0 else 'o'
            ax.scatter(price, quality, s=size*3, c=color, alpha=0.6,
                      edgecolors=self.branding.PRIMARY_COLOR, linewidth=2,
                      marker=marker, label=name)

            # Add labels
            ax.annotate(name, (price, quality),
                       xytext=(10, 10), textcoords='offset points',
                       fontsize=9, fontweight='bold' if i == 0 else 'normal')

        ax.set_xlabel('Price Point (1-10)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Quality/Innovation (1-10)', fontsize=12, fontweight='bold')
        ax.set_title('Competitive Positioning Matrix',
                    fontsize=16, fontweight='bold', color=self.branding.PRIMARY_COLOR)

        ax.set_xlim(4, 10)
        ax.set_ylim(4, 10)
        ax.grid(True, alpha=0.3)
        ax.legend(loc='upper left', framealpha=0.9)

        # Add quadrant labels
        ax.text(7, 9.5, 'Premium', ha='center', fontsize=10,
               style='italic', alpha=0.5)
        ax.text(9.5, 9.5, 'Luxury', ha='center', fontsize=10,
               style='italic', alpha=0.5)
        ax.text(5, 9.5, 'High Value', ha='center', fontsize=10,
               style='italic', alpha=0.5)

        filename = f"{creator_name}_competitive_matrix.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)

    def create_revenue_projections(self, creator_name: str) -> str:
        """Create 3-year revenue projection chart."""
        fig, ax = plt.subplots(figsize=(12, 7))

        # Sample projection data
        months = np.arange(1, 37)  # 36 months
        revenue = []

        # Year 1: Growth from 0 to 500K
        year1 = np.linspace(0, 500000, 12)
        # Year 2: Growth from 500K to 2M
        year2 = np.linspace(500000, 2000000, 12)
        # Year 3: Growth from 2M to 5M
        year3 = np.linspace(2000000, 5000000, 12)

        revenue = np.concatenate([year1, year2, year3])

        # Add some variance
        revenue = revenue * (1 + np.random.uniform(-0.1, 0.1, len(revenue)))

        ax.plot(months, revenue / 1000000, linewidth=3,
               color=self.branding.ACCENT_COLOR, label='Projected Revenue')
        ax.fill_between(months, 0, revenue / 1000000,
                        alpha=0.2, color=self.branding.ACCENT_COLOR)

        # Add year markers
        for year in [12, 24, 36]:
            ax.axvline(x=year, color=self.branding.PRIMARY_COLOR,
                      linestyle='--', alpha=0.3)
            ax.text(year, ax.get_ylim()[1] * 0.95, f'Year {year//12}',
                   ha='center', fontsize=10, style='italic')

        ax.set_xlabel('Months', fontsize=12, fontweight='bold')
        ax.set_ylabel('Revenue ($M)', fontsize=12, fontweight='bold')
        ax.set_title('3-Year Revenue Projections',
                    fontsize=16, fontweight='bold', color=self.branding.PRIMARY_COLOR)
        ax.grid(True, alpha=0.3)
        ax.legend(loc='upper left', fontsize=11)

        # Format y-axis as currency
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:.1f}M'))

        filename = f"{creator_name}_revenue_projections.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)

    def create_milestone_timeline(self, data: ApplicationData, creator_name: str) -> str:
        """Create visual milestone timeline."""
        fig, ax = plt.subplots(figsize=(14, 6))

        # Sample milestones
        milestones = [
            ('Q1 2025', 'Launch MVP', 0),
            ('Q2 2025', 'First 1K Customers', 1),
            ('Q3 2025', 'Break Even', 2),
            ('Q4 2025', 'Series A Funding', 3),
            ('Q2 2026', 'Expand to 3 Markets', 4),
            ('Q4 2026', 'Profitability', 5),
            ('Q2 2027', '10M ARR', 6),
        ]

        y_positions = [1, 1.3, 1, 1.3, 1, 1.3, 1]

        for i, (date, milestone, x) in enumerate(milestones):
            y = y_positions[i]
            color = self.branding.CHART_COLOR_PALETTE[i % len(self.branding.CHART_COLOR_PALETTE)]

            # Draw milestone point
            ax.scatter(x, y, s=400, c=color, alpha=0.8, edgecolors='white', linewidth=3, zorder=3)

            # Draw milestone label
            ax.text(x, y + 0.25, milestone, ha='center', va='bottom',
                   fontsize=10, fontweight='bold', wrap=True)
            ax.text(x, y - 0.2, date, ha='center', va='top',
                   fontsize=9, style='italic', color=self.branding.LIGHT_TEXT)

        # Draw connecting line
        ax.plot(range(len(milestones)), [1.15] * len(milestones),
               color=self.branding.PRIMARY_COLOR, linewidth=3, alpha=0.3, zorder=1)

        ax.set_xlim(-0.5, len(milestones) - 0.5)
        ax.set_ylim(0.5, 2)
        ax.axis('off')

        plt.title('Strategic Roadmap & Key Milestones',
                 fontsize=16, fontweight='bold', color=self.branding.PRIMARY_COLOR, pad=20)

        filename = f"{creator_name}_milestone_timeline.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)

    def create_customer_acquisition_funnel(self, creator_name: str) -> str:
        """Create customer acquisition funnel visualization."""
        fig, ax = plt.subplots(figsize=(10, 8))

        stages = [
            ('Awareness', 100000),
            ('Interest', 50000),
            ('Consideration', 20000),
            ('Intent', 10000),
            ('Purchase', 5000),
            ('Loyalty', 3500),
        ]

        colors = self.branding.CHART_COLOR_PALETTE[:len(stages)]
        y_positions = range(len(stages))

        max_width = max(count for _, count in stages)

        for i, ((stage, count), color) in enumerate(zip(stages, colors)):
            width = count / max_width
            ax.barh(i, width, height=0.7, color=color, alpha=0.8,
                   edgecolor=self.branding.PRIMARY_COLOR, linewidth=2)

            # Add labels
            ax.text(width + 0.02, i, f'{count:,}', va='center', fontsize=11, fontweight='bold')
            ax.text(0.01, i, stage, va='center', fontsize=11, fontweight='bold', color='white')

            # Add conversion rate
            if i > 0:
                conversion = (count / stages[i-1][1]) * 100
                ax.text(width / 2, i - 0.4, f'{conversion:.1f}% conversion',
                       ha='center', fontsize=9, style='italic', alpha=0.7)

        ax.set_xlim(0, 1.2)
        ax.set_ylim(-0.5, len(stages) - 0.5)
        ax.set_yticks([])
        ax.set_xticks([])
        ax.spines['top'].set_visible(False)
        ax.spines('right').set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)

        plt.title('Customer Acquisition Funnel',
                 fontsize=16, fontweight='bold', color=self.branding.PRIMARY_COLOR, pad=20)

        filename = f"{creator_name}_acquisition_funnel.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)

    def create_market_share_chart(self, creator_name: str) -> str:
        """Create market share projection chart."""
        fig, ax = plt.subplots(figsize=(10, 7))

        companies = ['Our Brand', 'Competitor A', 'Competitor B',
                     'Competitor C', 'Others']
        current_share = [0, 35, 25, 20, 20]
        projected_share = [15, 30, 22, 18, 15]

        x = np.arange(len(companies))
        width = 0.35

        bars1 = ax.bar(x - width/2, current_share, width, label='Current Market Share',
                      color=self.branding.CHART_COLOR_PALETTE[1], alpha=0.7)
        bars2 = ax.bar(x + width/2, projected_share, width, label='Projected (Year 3)',
                      color=self.branding.ACCENT_COLOR, alpha=0.8)

        # Add value labels
        for bars in [bars1, bars2]:
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                       f'{height}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

        ax.set_ylabel('Market Share (%)', fontsize=12, fontweight='bold')
        ax.set_title('Market Share Analysis & Projections',
                    fontsize=16, fontweight='bold', color=self.branding.PRIMARY_COLOR)
        ax.set_xticks(x)
        ax.set_xticklabels(companies, rotation=0, ha='center')
        ax.legend(loc='upper right', fontsize=11)
        ax.grid(axis='y', alpha=0.3)
        ax.set_ylim(0, max(max(current_share), max(projected_share)) + 10)

        filename = f"{creator_name}_market_share.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, dpi=self.branding.CHART_DPI, bbox_inches='tight',
                   facecolor='white')
        plt.close()

        return str(filepath)
