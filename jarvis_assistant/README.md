# Jarvis - Personal RAG-Based AI Assistant

A local, privacy-focused AI assistant powered by your WhatsApp chat history. Jarvis knows you deeply and responds with your personality, preferences, and context.

## Overview

Jarvis is a Retrieval-Augmented Generation (RAG) system that:
- Processes your WhatsApp chat history into structured facts
- Uses vector embeddings for efficient context retrieval
- Generates personalized responses using Claude or GPT models
- Runs entirely on your local machine (except LLM API calls)
- Maintains conversation history for contextual responses

## Features

- **Privacy-First**: All data processed and stored locally
- **Cost-Efficient**: Uses free local embeddings + minimal LLM API calls
- **Smart Retrieval**: Vector similarity search finds relevant memories
- **Conversational**: Maintains context across multiple queries
- **Extensible**: Modular design for easy customization

## Architecture

```
┌─────────────────┐
│ WhatsApp JSON   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preprocessor   │ ──► SQLite Facts DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Memory Store   │ ──► Chroma Vector DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RAG Engine    │ ──► LLM (Claude/GPT)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CLI Assistant  │
└─────────────────┘
```

## Installation

### 1. Prerequisites

- Python 3.8 or higher
- macOS, Linux, or Windows
- API key for Anthropic (Claude) or OpenAI (GPT)

### 2. Setup

```bash
# Clone the repository (or navigate to the project directory)
cd jarvis_assistant

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Required Configuration:**

```bash
# For Anthropic (Claude) - Recommended
ANTHROPIC_API_KEY=sk-ant-xxxxx
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022

# Or for OpenAI (GPT)
# OPENAI_API_KEY=sk-xxxxx
# LLM_PROVIDER=openai
# LLM_MODEL=gpt-4

# Embedding model (sentence-transformers is free and local)
EMBEDDING_PROVIDER=sentence-transformers
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Your name (used to filter messages)
USER_NAME=Arunav
```

## Usage

### Step 1: Preprocess WhatsApp Chat

Place your WhatsApp chat JSON export in the `data/` directory.

```bash
python preprocess.py data/your_whatsapp_chat.json
```

This will:
- Parse the JSON
- Extract your messages
- Classify them into fact types
- Store everything in `memory_db/facts.db`

**Output:**
```
Loading WhatsApp JSON from data/chat.json...
✓ Loaded 133,484 messages
✓ Filtered 67,523 messages from Arunav
Extracting facts from messages...
✓ Extracted 67,523 facts
Saving facts to database...
✓ Saved 67,523 facts to memory_db/facts.db
```

### Step 2: Build Vector Index

```bash
python memory_store.py build
```

This creates embeddings for all facts and stores them in Chroma vector database.

**Output:**
```
Loading sentence-transformers model: all-MiniLM-L6-v2
Loaded 67,523 facts from database
Indexing: 100%|████████████████| 676/676 [02:15<00:00]
✓ Vector index built with 67,523 facts
```

### Step 3: Start Jarvis

**Interactive Mode:**

```bash
python assistant.py
```

**Single Query Mode:**

```bash
python assistant.py "What are my business interests?"
```

## Commands

Within the interactive CLI:

- `/help` - Show available commands
- `/stats` - Display memory statistics
- `/history` - Show recent conversation history
- `/clear` - Clear conversation context
- `/exit` - Exit Jarvis

## Examples

```
Arunav: What businesses am I interested in?

Jarvis: Based on your conversations, you're deeply interested in several
business areas: creator economy platforms (like 8origin), AI-powered tools,
SaaS products, and investment opportunities in crypto and tech startups.
You've frequently discussed building products that help creators monetize
their work and scaling businesses through technology.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Arunav: Remind me what I said about my morning routine

Jarvis: You mentioned that you typically start your mornings with exercise,
followed by checking markets and catching up on tech news. You also
mentioned preferring to do deep work in the morning when you're most
focused, and saving meetings for afternoons.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Arunav: /stats

=== Memory Statistics ===
Total facts: 67,523
Vector indexed: 67,523

Facts by type:
  general: 45,234
  business: 8,567
  interest: 4,321
  personal_trait: 3,210
  investment: 2,456
  ...
```

## Project Structure

```
jarvis_assistant/
├── assistant.py          # Main CLI interface
├── rag_engine.py         # RAG pipeline and LLM integration
├── memory_store.py       # Vector database management
├── preprocess.py         # WhatsApp JSON processor
├── config.py             # Configuration management
├── requirements.txt      # Python dependencies
├── .env.example          # Example environment variables
├── .env                  # Your API keys (git-ignored)
├── README.md             # This file
├── data/                 # WhatsApp JSON files (git-ignored)
└── memory_db/            # SQLite + Chroma databases (git-ignored)
    ├── facts.db          # Structured facts database
    ├── chroma_db/        # Vector embeddings
    └── conversations.jsonl  # Conversation history
```

## Updating Memory

When you have new WhatsApp messages:

1. Export new JSON from WhatsApp
2. Run preprocessor: `python preprocess.py data/new_messages.json`
3. Rebuild index: `python memory_store.py build`

## Customization

### Changing Fact Classification

Edit `preprocess.py` → `_classify_message()` to adjust how messages are categorized.

### Adjusting Retrieval

Edit `.env`:
- `TOP_K_RESULTS=10` - Number of memories to retrieve per query
- `MAX_CONTEXT_TOKENS=4000` - Maximum context length

### Customizing Personality

Edit `rag_engine.py` → `_build_system_prompt()` to adjust Jarvis's personality and response style.

## Cost Estimation

**One-time Setup:**
- Embeddings: FREE (using sentence-transformers locally)
- Processing: FREE (all local)

**Per Query:**
- Claude 3.5 Sonnet: ~$0.003 - $0.015 per query (depending on context)
- GPT-4: ~$0.006 - $0.030 per query
- With 10K queries/month: ~$30-$150/month

**Cost Optimization:**
- Use Claude 3 Haiku for cheaper responses (~10x less)
- Use local LLMs (Ollama) for FREE queries (no API costs)
- Reduce `TOP_K_RESULTS` to use less context

## Troubleshooting

### "No facts found in database"
- Make sure you ran `python preprocess.py` first
- Check that your WhatsApp JSON is in the correct format

### "ANTHROPIC_API_KEY is required"
- Copy `.env.example` to `.env`
- Add your API key to `.env`

### "Model not found" or API errors
- Verify your API key is correct
- Check you have API credits
- Ensure model name is correct in `.env`

### Vector index is slow
- First-time indexing of 67K+ facts takes 2-5 minutes (normal)
- Subsequent queries are fast (<1 second)
- Consider using smaller `EMBEDDING_MODEL` if needed

## Advanced Features

### Using Local LLMs (Ollama)

To avoid API costs entirely:

1. Install Ollama
2. Pull a model: `ollama pull llama3`
3. Modify `rag_engine.py` to use Ollama API (localhost:11434)

### WhatsApp Integration

The codebase is structured to support WhatsApp bot integration:

1. Use `rag_engine.query()` in your bot webhook
2. See `rag_engine.py` for API usage examples

### Export Capabilities

Memory can be exported:

```bash
# Export facts as JSON
sqlite3 memory_db/facts.db "SELECT * FROM facts" -json > export.json

# Export conversations
cat memory_db/conversations.jsonl
```

## Privacy & Security

- **All data stays local** except LLM API calls
- WhatsApp JSON never leaves your machine
- No telemetry or tracking
- API calls only contain query + relevant context (not full history)
- Delete `memory_db/` to remove all processed data

## License

MIT License - Use freely for personal or commercial projects.

## Contributing

This is a personal assistant, but you can fork and customize:

1. Fork the repo
2. Make your changes
3. Share improvements via pull request

## Support

For issues or questions:
- Check troubleshooting section above
- Review code comments for implementation details
- Adjust configuration in `.env` for different behavior

---

**Built with:**
- [Anthropic Claude](https://anthropic.com) - LLM API
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [Sentence Transformers](https://www.sbert.net/) - Local embeddings
- Python 3 - Core implementation
