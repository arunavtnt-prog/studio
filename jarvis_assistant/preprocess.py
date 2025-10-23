"""
WhatsApp Chat JSON Preprocessor
Extracts messages from Arunav and converts them into structured facts.
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import re
from tqdm import tqdm
import config

class WhatsAppPreprocessor:
    """Process WhatsApp JSON export and extract structured facts."""

    def __init__(self, json_path: str):
        self.json_path = Path(json_path)
        self.user_name = config.USER_NAME
        self.messages = []
        self.facts = []

    def load_json(self):
        """Load WhatsApp JSON export."""
        print(f"Loading WhatsApp JSON from {self.json_path}...")
        with open(self.json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Handle different JSON structures
        if isinstance(data, list):
            self.messages = data
        elif isinstance(data, dict) and 'messages' in data:
            self.messages = data['messages']
        else:
            raise ValueError("Unknown JSON structure. Expected list of messages or dict with 'messages' key")

        print(f"✓ Loaded {len(self.messages):,} messages")

    def filter_user_messages(self) -> List[Dict]:
        """Extract messages from the target user (Arunav)."""
        user_messages = []

        for msg in self.messages:
            # Handle different possible field names
            sender = msg.get('from') or msg.get('sender') or msg.get('author') or ''

            # Check if message is from Arunav
            if self.user_name.lower() in sender.lower():
                user_messages.append(msg)

        print(f"✓ Filtered {len(user_messages):,} messages from {self.user_name}")
        return user_messages

    def extract_facts(self, messages: List[Dict]) -> List[Dict]:
        """
        Extract structured facts from messages.
        This is a rule-based extraction - can be enhanced with NLP/LLM.
        """
        facts = []

        print("Extracting facts from messages...")

        for i, msg in enumerate(tqdm(messages)):
            text = msg.get('text') or msg.get('message') or msg.get('body') or ''
            timestamp = msg.get('timestamp') or msg.get('datetime') or msg.get('date') or msg.get('time') or ''
            msg_id = msg.get('id') or i

            if not text or len(text.strip()) < 5:
                continue

            # Store the raw message as a memory item
            fact = {
                'type': self._classify_message(text),
                'content': text.strip(),
                'source_reference': f"msg_{msg_id}",
                'timestamp': timestamp,
                'raw_text': text
            }

            facts.append(fact)

        print(f"✓ Extracted {len(facts):,} facts")
        return facts

    def _classify_message(self, text: str) -> str:
        """
        Classify message type based on content.
        Simple rule-based classification - can be enhanced with ML.
        """
        text_lower = text.lower()

        # Business/work related
        if any(word in text_lower for word in ['business', 'startup', 'company', 'meeting', 'client', 'revenue', 'pitch', 'investor']):
            return 'business'

        # Investment related
        if any(word in text_lower for word in ['invest', 'stock', 'crypto', 'trading', 'portfolio', 'bitcoin', 'eth']):
            return 'investment'

        # Interest/hobby
        if any(word in text_lower for word in ['love', 'enjoy', 'favorite', 'like', 'interested', 'passion', 'hobby']):
            return 'interest'

        # Habits/routines
        if any(word in text_lower for word in ['every day', 'always', 'usually', 'routine', 'habit', 'morning', 'evening']):
            return 'habit'

        # Personal traits
        if any(word in text_lower for word in ['i am', "i'm", 'i feel', 'i think', 'i believe', 'my opinion']):
            return 'personal_trait'

        # Preferences
        if any(word in text_lower for word in ['prefer', 'rather', 'better than', 'dont like', "don't like", 'hate']):
            return 'preference'

        # Relationships
        if any(word in text_lower for word in ['friend', 'family', 'mom', 'dad', 'brother', 'sister', 'relationship']):
            return 'relationship'

        # Humor/personality
        if any(word in text_lower for word in ['haha', 'lol', 'lmao', '😂', '🤣', 'funny', 'joke']):
            return 'humor'

        # Default
        return 'general'

    def save_to_db(self, facts: List[Dict]):
        """Save facts to SQLite database."""
        print("Saving facts to database...")

        # Create database connection
        conn = sqlite3.connect(config.FACTS_DB_PATH)
        cursor = conn.cursor()

        # Create facts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                source_reference TEXT,
                timestamp TEXT,
                raw_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create index for faster retrieval
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_type ON facts(type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON facts(timestamp)')

        # Insert facts
        for fact in tqdm(facts):
            cursor.execute('''
                INSERT INTO facts (type, content, source_reference, timestamp, raw_text)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                fact['type'],
                fact['content'],
                fact['source_reference'],
                fact['timestamp'],
                fact['raw_text']
            ))

        conn.commit()
        conn.close()

        print(f"✓ Saved {len(facts):,} facts to {config.FACTS_DB_PATH}")

    def process(self):
        """Main processing pipeline."""
        self.load_json()
        user_messages = self.filter_user_messages()
        self.facts = self.extract_facts(user_messages)
        self.save_to_db(self.facts)

        # Print statistics
        print("\n=== Processing Complete ===")
        print(f"Total messages processed: {len(self.messages):,}")
        print(f"User messages: {len(user_messages):,}")
        print(f"Facts extracted: {len(self.facts):,}")

        # Fact type distribution
        type_counts = {}
        for fact in self.facts:
            type_counts[fact['type']] = type_counts.get(fact['type'], 0) + 1

        print("\nFact Distribution:")
        for fact_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {fact_type}: {count:,}")

def main():
    """CLI entry point for preprocessing."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python preprocess.py <whatsapp_json_path>")
        print("Example: python preprocess.py data/whatsapp_chat.json")
        sys.exit(1)

    json_path = sys.argv[1]

    if not Path(json_path).exists():
        print(f"Error: File not found: {json_path}")
        sys.exit(1)

    preprocessor = WhatsAppPreprocessor(json_path)
    preprocessor.process()

if __name__ == "__main__":
    main()
