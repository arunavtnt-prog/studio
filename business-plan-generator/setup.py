"""
Setup script for Business Plan Generator
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read README
readme_file = Path(__file__).parent / "README.md"
long_description = ""
if readme_file.exists():
    long_description = readme_file.read_text(encoding="utf-8")

setup(
    name="business-plan-generator",
    version="1.0.0",
    description="AI-powered business plan generation system for brand accelerators",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Brand Accelerator Team",
    author_email="contact@example.com",
    url="https://github.com/yourusername/business-plan-generator",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "openai>=1.12.0",
        "anthropic>=0.18.0",
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "matplotlib>=3.7.0",
        "seaborn>=0.12.0",
        "markdown>=3.5.0",
        "weasyprint>=60.0",
        "Pillow>=10.0.0",
        "python-dateutil>=2.8.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "business-plan-gen=main:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Office/Business",
        "Topic :: Text Processing :: Markup",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
    ],
    keywords="business-plan ai content-generation pdf startup",
)
