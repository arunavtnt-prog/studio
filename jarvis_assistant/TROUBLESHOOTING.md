# Troubleshooting Guide

## Common Issues and Solutions

### 1. "TypeError: Client.__init__() got an unexpected keyword argument 'proxies'"

**Cause:** Version incompatibility between Anthropic library and Python 3.13

**Solution:**
```bash
# Upgrade anthropic library
pip install --upgrade anthropic httpx

# Or reinstall all dependencies
pip install --upgrade -r requirements.txt
```

If still having issues:
```bash
pip uninstall anthropic
pip install anthropic>=0.40.0
```

### 2. ChromaDB Telemetry Warnings

**Warning:**
```
Failed to send telemetry event: capture() takes 1 positional argument but 3 were given
```

**Solution:** This is non-critical but can be disabled:

```bash
# Set environment variable to disable telemetry
export ANONYMIZED_TELEMETRY=False
```

Or add to your `.env` file:
```
ANONYMIZED_TELEMETRY=False
```

### 3. "ModuleNotFoundError: No module named 'tqdm'"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 4. "No module named 'sentence_transformers'"

**Solution:**
```bash
pip install sentence-transformers
```

First-time installation downloads ~90MB model from Hugging Face.

### 5. "ANTHROPIC_API_KEY is required"

**Cause:** API key not configured

**Solution:**
1. Copy `.env.example` to `.env`
2. Add your API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

Get API key from: https://console.anthropic.com/

### 6. SQLite "database is locked" Error

**Cause:** Multiple processes accessing database

**Solution:**
```bash
# Close all Python processes accessing the database
pkill -f "python.*assistant"

# If persists, remove lock file
rm memory_db/facts.db-journal
```

### 7. Vector Index Build is Slow

**Expected:** 52K+ facts takes 3-7 minutes to index (first time only)

**Speed up:**
- Use smaller embedding model in `.env`:
  ```
  EMBEDDING_MODEL=all-MiniLM-L6-v2  # Fast, 80MB
  ```

**Don't worry if you see:**
- "Downloading model..." - Only happens once
- Progress bars at 0% - Buffering, will move quickly

### 8. Memory/RAM Issues During Indexing

**Symptoms:** System slows down or crashes during `memory_store.py build`

**Solutions:**

**Option A:** Reduce batch size in `memory_store.py`
```python
# Line ~70, change batch_size
def build_vector_index(self, batch_size: int = 50):  # Reduced from 100
```

**Option B:** Use smaller model
```bash
# In .env
EMBEDDING_MODEL=paraphrase-MiniLM-L3-v2  # Smaller, faster
```

### 9. API Rate Limit Errors

**Error:** `anthropic.RateLimitError`

**Solutions:**
1. Wait a minute and try again
2. Switch to Haiku model (cheaper, faster):
   ```
   LLM_MODEL=claude-3-haiku-20240307
   ```
3. Reduce context with `TOP_K_RESULTS=5` in `.env`

### 10. "No facts found in database"

**Cause:** Preprocessing step was skipped or failed

**Solution:**
```bash
# Run preprocessing
python preprocess.py data/whatsapp_chat.json

# Verify facts were saved
python memory_store.py stats

# If stats show 0 facts, check:
ls -lh memory_db/facts.db  # Should be >1MB
```

### 11. Python 3.13 Compatibility Issues

**If you're using Python 3.13:**

Some dependencies may not be fully compatible. Use Python 3.10-3.12:

```bash
# Install pyenv (if not installed)
brew install pyenv  # macOS
# or follow: https://github.com/pyenv/pyenv#installation

# Install Python 3.12
pyenv install 3.12.0
pyenv local 3.12.0

# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 12. Import Errors After Updates

**Solution:** Clean reinstall
```bash
# Deactivate and remove old venv
deactivate
rm -rf venv

# Create fresh environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 13. "Connection Error" or API Timeouts

**Cause:** Network issues or API downtime

**Solutions:**
1. Check internet connection
2. Verify API status: https://status.anthropic.com/
3. Add retry logic or try again in a few minutes

### 14. Incorrect or Empty Responses

**Causes:**
- Not enough relevant context retrieved
- User name mismatch in data

**Solutions:**

**Check user name:**
```bash
# Verify name in JSON
head -100 data/whatsapp_chat.json | grep -i "sender"

# Update .env if needed
USER_NAME=YourActualName
```

**Increase context:**
```bash
# In .env
TOP_K_RESULTS=20  # Increased from 10
```

**Rebuild with correct name:**
```bash
# Update .env, then rebuild
rm memory_db/facts.db
rm -rf memory_db/chroma_db
python preprocess.py data/whatsapp_chat.json
python memory_store.py build
```

## Getting More Help

### Check Logs
```bash
# View last conversation
tail memory_db/conversations.jsonl

# Check database stats
python memory_store.py stats

# Test retrieval directly
python memory_store.py search "test query"
```

### Clean Slate Reset
```bash
# Remove all generated data
rm -rf memory_db/
rm -rf venv/

# Start fresh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python preprocess.py data/whatsapp_chat.json
python memory_store.py build
```

### System Requirements

**Minimum:**
- Python 3.10-3.12 (not 3.13 yet)
- 4GB RAM
- 2GB disk space

**Recommended:**
- Python 3.11 or 3.12
- 8GB RAM
- 5GB disk space (for model cache)

### Verify Installation

```bash
# Test each component
python -c "import anthropic; print('✓ Anthropic')"
python -c "import chromadb; print('✓ ChromaDB')"
python -c "import sentence_transformers; print('✓ Sentence Transformers')"
python -c "from dotenv import load_dotenv; print('✓ Python-dotenv')"

# Test preprocessing
python preprocess.py data/whatsapp_chat.json

# Test memory
python memory_store.py stats

# Test RAG (requires API key)
python rag_engine.py "test query"
```

## Still Having Issues?

1. Check Python version: `python3 --version`
2. Check pip version: `pip --version`
3. Try the clean slate reset above
4. Open an issue with:
   - Python version
   - Operating system
   - Full error message
   - Output of `pip list`
