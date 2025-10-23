# Complete Setup Instructions for Jarvis

## Current Status

✓ Code complete and pushed to GitHub
✓ Setup automation script created
⏳ **Waiting for WhatsApp JSON file**

## What You Need

**WhatsApp Chat Export (JSON format)**

Your 512-day chat with ~133,484 messages in JSON format.

### Expected JSON Structure

The preprocessor supports multiple JSON formats:

**Format 1: Array of messages**
```json
[
  {
    "from": "Arunav",
    "text": "message content",
    "timestamp": "2024-01-01T10:00:00Z"
  },
  ...
]
```

**Format 2: Object with messages array**
```json
{
  "messages": [
    {
      "author": "Arunav",
      "message": "message content",
      "date": "2024-01-01"
    },
    ...
  ]
}
```

The preprocessor handles various field names:
- Sender: `from`, `sender`, `author`
- Content: `text`, `message`, `body`
- Time: `timestamp`, `date`, `time`

## Setup Steps

### Option A: Automated Setup (Recommended)

```bash
cd jarvis_assistant

# 1. Place your JSON file
# Copy whatsapp_chat.json to jarvis_assistant/data/

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Configure API key
cp .env.example .env
nano .env  # Add your ANTHROPIC_API_KEY

# 4. Run automated setup
./setup.sh

# 5. Start Jarvis
python assistant.py
```

### Option B: Manual Setup

```bash
cd jarvis_assistant

# 1. Virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure
cp .env.example .env
# Edit .env and add API key

# 4. Process WhatsApp data
python preprocess.py data/whatsapp_chat.json

# 5. Build vector index
python memory_store.py build

# 6. Run Jarvis
python assistant.py
```

## Providing the JSON File

### Method 1: Direct Upload (Fastest)

If you're working locally, place the file at:
```
jarvis_assistant/data/whatsapp_chat.json
```

### Method 2: GitHub

```bash
# From your local machine
cd jarvis_assistant
cp /path/to/your/whatsapp_chat.json data/
git add data/whatsapp_chat.json
git commit -m "Add WhatsApp chat data"
git push origin claude/local-rag-assistant-011CUPZ6e9ZCyhHwiKhJuJtf
```

**Note:** The `.gitignore` is configured to ignore `data/*.json` for privacy. You'll need to force-add it:
```bash
git add -f data/whatsapp_chat.json
```

### Method 3: Share via message

Simply share the JSON content or file path, and I'll place it in the correct location.

## Verification Checklist

Before running setup, ensure:

- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] WhatsApp JSON file exists and is valid JSON
- [ ] JSON contains messages from "Arunav"
- [ ] `.env` file created with `ANTHROPIC_API_KEY`
- [ ] Virtual environment activated

## Expected Processing Time

For 133,484 messages:

1. **Preprocessing**: 2-5 minutes
   - Parses JSON
   - Extracts facts
   - Saves to SQLite

2. **Vector Indexing**: 3-7 minutes
   - Downloads sentence-transformer model (first time only)
   - Generates embeddings for all facts
   - Builds Chroma vector database

3. **First Query**: ~2-5 seconds
   - Loads models
   - Retrieves context
   - Calls Claude API
   - Returns response

**Total setup time: ~10 minutes**

## Troubleshooting Setup

### "File not found: data/whatsapp_chat.json"
→ Ensure file is in `jarvis_assistant/data/` directory

### "Unknown JSON structure"
→ Check JSON format matches expected structure above

### "No messages found from Arunav"
→ Verify the sender name in JSON matches "Arunav" (case-insensitive)
→ Or update `USER_NAME=` in `.env` to match the actual sender name

### "Model download failed"
→ Ensure internet connection for first-time model download
→ The sentence-transformers model is ~90MB

### Processing is slow
→ This is normal for large datasets
→ 133K messages takes 5-10 minutes total
→ Subsequent queries are fast (<1 second)

## After Setup

Once setup completes, you can:

```bash
# Start interactive session
python assistant.py

# Single query
python assistant.py "What are my business interests?"

# View statistics
python memory_store.py stats

# Search memory directly
python memory_store.py search "crypto investments"

# Check conversation history
cat memory_db/conversations.jsonl | tail -10
```

## What Gets Created

```
jarvis_assistant/
├── venv/                      # Virtual environment
├── data/
│   └── whatsapp_chat.json     # Your WhatsApp data
├── memory_db/
│   ├── facts.db               # SQLite database (~50-100MB)
│   ├── chroma_db/             # Vector embeddings (~200-400MB)
│   └── conversations.jsonl    # Chat history
└── .env                       # Your configuration
```

## Privacy & Security

- All data stays on your local machine
- `.gitignore` prevents data from being committed
- Only queries + context sent to Claude API (not full database)
- Delete `memory_db/` anytime to remove processed data

## Ready to Proceed?

**Please provide your WhatsApp JSON file using one of the methods above.**

Once you share it, I'll:
1. ✓ Place it in the correct location
2. ✓ Run the preprocessing
3. ✓ Build the vector index
4. ✓ Test the assistant
5. ✓ Show you example queries

---

**Status:** Waiting for `whatsapp_chat.json` file
