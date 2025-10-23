# Jarvis Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies

```bash
cd jarvis_assistant

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Configure API Keys

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Anthropic API key
nano .env  # or use any text editor
```

Add your API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Usage (3 steps)

### Step 1: Place WhatsApp JSON

Put your WhatsApp chat export JSON file in the `data/` folder:

```bash
# Example: data/whatsapp_chat.json
```

### Step 2: Process & Index

```bash
# Process WhatsApp JSON
python preprocess.py data/whatsapp_chat.json

# Build vector index
python memory_store.py build
```

### Step 3: Run Jarvis

```bash
# Interactive mode
python assistant.py

# Or single query
python assistant.py "What are my interests?"
```

## Example Session

```bash
$ python assistant.py

🤖 Initializing Jarvis...
✓ Configuration loaded: anthropic/claude-3-5-sonnet-20241022
✓ Embeddings: sentence-transformers/all-MiniLM-L6-v2
✓ Jarvis ready for Arunav
✓ Memory loaded: 67,523 facts indexed

============================================================
  JARVIS - Personal AI Assistant for Arunav
============================================================

Type /help for commands or start asking questions!
Press Ctrl+C or type /exit to quit

Arunav: What businesses have I discussed?

Jarvis: Based on your WhatsApp history, you've discussed several business
ventures including creator economy platforms like 8origin Studios, AI-powered
tools and SaaS products, crypto trading and investment strategies, and various
startup ideas in the tech space. You've shown particular interest in building
products that help creators monetize their content and scale their businesses.

Arunav: /exit

👋 Goodbye!
```

## Troubleshooting

**"No module named 'dotenv'"**
→ Run: `pip install -r requirements.txt`

**"ANTHROPIC_API_KEY is required"**
→ Make sure `.env` file exists and contains your API key

**"No facts found in database"**
→ Run preprocessing first: `python preprocess.py data/your_file.json`

## Commands Reference

**CLI Commands:**
- `/help` - Show commands
- `/stats` - Memory statistics
- `/history` - Recent conversations
- `/clear` - Clear context
- `/exit` - Quit

**Management Scripts:**
```bash
# View memory stats
python memory_store.py stats

# Search memory directly
python memory_store.py search "business ideas"

# Test RAG engine
python rag_engine.py "What do I like?"
```

## Next Steps

1. **Customize personality**: Edit `rag_engine.py` → `_build_system_prompt()`
2. **Adjust retrieval**: Change `TOP_K_RESULTS` in `.env`
3. **Add more data**: Process additional WhatsApp exports
4. **Reduce costs**: Switch to `claude-3-haiku-20240307` in `.env`

---

**Need help?** Check README.md for full documentation.
