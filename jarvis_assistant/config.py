"""
Configuration management for Jarvis Assistant.
Loads settings from .env file or environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Project paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MEMORY_DB_DIR = BASE_DIR / "memory_db"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
MEMORY_DB_DIR.mkdir(exist_ok=True)

# API Keys
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Model Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic")  # anthropic or openai
LLM_MODEL = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")

# Embedding Configuration
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# RAG Configuration
TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", "10"))
MAX_CONTEXT_TOKENS = int(os.getenv("MAX_CONTEXT_TOKENS", "4000"))

# User Configuration
USER_NAME = os.getenv("USER_NAME", "Arunav")

# Database paths
FACTS_DB_PATH = MEMORY_DB_DIR / "facts.db"
VECTOR_DB_PATH = MEMORY_DB_DIR / "chroma_db"
CONVERSATION_HISTORY_PATH = MEMORY_DB_DIR / "conversations.jsonl"

def validate_config():
    """Validate that required configuration is present."""
    if LLM_PROVIDER == "anthropic" and not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is required when using Anthropic provider")
    if LLM_PROVIDER == "openai" and not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is required when using OpenAI provider")
    if EMBEDDING_PROVIDER == "openai" and not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is required for OpenAI embeddings")

    print(f"✓ Configuration loaded: {LLM_PROVIDER}/{LLM_MODEL}")
    print(f"✓ Embeddings: {EMBEDDING_PROVIDER}/{EMBEDDING_MODEL}")
