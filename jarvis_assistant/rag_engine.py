"""
RAG Engine - Retrieval-Augmented Generation
Combines memory retrieval with LLM to generate contextual responses.
"""

import json
from typing import List, Dict, Optional
from datetime import datetime
import anthropic
import openai
from memory_store import MemoryStore
import config

class RAGEngine:
    """RAG engine that retrieves context and generates responses."""

    def __init__(self):
        """Initialize RAG engine with memory store and LLM client."""
        self.memory = MemoryStore()

        # Initialize LLM client
        if config.LLM_PROVIDER == "anthropic":
            self.llm_client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
            self.generate_response = self._generate_with_anthropic
        elif config.LLM_PROVIDER == "openai":
            openai.api_key = config.OPENAI_API_KEY
            self.generate_response = self._generate_with_openai
        else:
            raise ValueError(f"Unknown LLM provider: {config.LLM_PROVIDER}")

        # Conversation history
        self.conversation_history = []

    def _build_context(self, facts: List[Dict]) -> str:
        """Build context string from retrieved facts."""
        if not facts:
            return "No relevant memories found."

        context_parts = []
        for fact in facts:
            context_parts.append(f"[{fact['type']}] {fact['content']}")

        return "\n".join(context_parts)

    def _build_system_prompt(self) -> str:
        """Build system prompt that defines Jarvis personality."""
        return f"""You are Jarvis, an AI assistant with complete knowledge of {config.USER_NAME}'s life, personality, and preferences based on 512 days of WhatsApp chat history.

Your role:
- You know {config.USER_NAME} deeply and personally
- Respond in a tone that mirrors {config.USER_NAME}'s communication style
- Reference specific memories and context when relevant
- Be helpful, insightful, and conversational
- Maintain {config.USER_NAME}'s personality traits in your responses
- When uncertain, acknowledge it rather than making up information

Key traits to embody:
- Use the same humor and language style as {config.USER_NAME}
- Reference past conversations and context naturally
- Be direct and authentic, as a close assistant would be
- Prioritize accuracy over politeness if there's tension

Remember: You are {config.USER_NAME}'s personal AI assistant with deep knowledge of their life."""

    def _generate_with_anthropic(self, query: str, context: str, conversation_history: List[Dict]) -> str:
        """Generate response using Anthropic Claude API."""

        # Build messages list
        messages = []

        # Add conversation history
        for turn in conversation_history[-5:]:  # Last 5 turns for context
            messages.append({
                "role": "user",
                "content": turn["query"]
            })
            messages.append({
                "role": "assistant",
                "content": turn["response"]
            })

        # Add current query with context
        current_message = f"""Relevant memories from {config.USER_NAME}'s WhatsApp history:

{context}

---

Query: {query}

Based on the memories above and your knowledge of {config.USER_NAME}, provide a helpful and personalized response."""

        messages.append({
            "role": "user",
            "content": current_message
        })

        # Call Claude API
        response = self.llm_client.messages.create(
            model=config.LLM_MODEL,
            max_tokens=2000,
            system=self._build_system_prompt(),
            messages=messages
        )

        return response.content[0].text

    def _generate_with_openai(self, query: str, context: str, conversation_history: List[Dict]) -> str:
        """Generate response using OpenAI GPT API."""

        # Build messages list
        messages = [
            {"role": "system", "content": self._build_system_prompt()}
        ]

        # Add conversation history
        for turn in conversation_history[-5:]:  # Last 5 turns
            messages.append({"role": "user", "content": turn["query"]})
            messages.append({"role": "assistant", "content": turn["response"]})

        # Add current query with context
        current_message = f"""Relevant memories from {config.USER_NAME}'s WhatsApp history:

{context}

---

Query: {query}

Based on the memories above and your knowledge of {config.USER_NAME}, provide a helpful and personalized response."""

        messages.append({"role": "user", "content": current_message})

        # Call OpenAI API
        response = openai.chat.completions.create(
            model=config.LLM_MODEL,
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )

        return response.choices[0].message.content

    def query(self, user_query: str, top_k: Optional[int] = None) -> Dict:
        """
        Process a query using RAG pipeline.

        Args:
            user_query: User's question or request
            top_k: Number of memories to retrieve (default from config)

        Returns:
            Dict with response, retrieved context, and metadata
        """
        # Retrieve relevant facts
        facts = self.memory.search(user_query, top_k=top_k)

        # Build context
        context = self._build_context(facts)

        # Generate response
        response_text = self.generate_response(
            query=user_query,
            context=context,
            conversation_history=self.conversation_history
        )

        # Save to conversation history
        conversation_turn = {
            "timestamp": datetime.now().isoformat(),
            "query": user_query,
            "response": response_text,
            "retrieved_facts_count": len(facts),
            "context_preview": context[:500]
        }
        self.conversation_history.append(conversation_turn)

        # Save conversation to disk
        self._save_conversation_turn(conversation_turn)

        return {
            "response": response_text,
            "retrieved_facts": facts,
            "context": context,
            "metadata": {
                "facts_retrieved": len(facts),
                "model": f"{config.LLM_PROVIDER}/{config.LLM_MODEL}",
                "timestamp": conversation_turn["timestamp"]
            }
        }

    def _save_conversation_turn(self, turn: Dict):
        """Save conversation turn to JSONL file for history."""
        with open(config.CONVERSATION_HISTORY_PATH, 'a', encoding='utf-8') as f:
            f.write(json.dumps(turn) + '\n')

    def load_conversation_history(self, limit: int = 20):
        """Load recent conversation history from disk."""
        if not config.CONVERSATION_HISTORY_PATH.exists():
            return

        with open(config.CONVERSATION_HISTORY_PATH, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Load last N conversations
        for line in lines[-limit:]:
            try:
                turn = json.loads(line)
                self.conversation_history.append(turn)
            except json.JSONDecodeError:
                continue

    def clear_conversation_history(self):
        """Clear in-memory conversation history."""
        self.conversation_history = []
        print("✓ Conversation history cleared")

    def close(self):
        """Clean up resources."""
        self.memory.close()

def main():
    """CLI test for RAG engine."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python rag_engine.py <query>")
        print("Example: python rag_engine.py 'What are my business interests?'")
        sys.exit(1)

    config.validate_config()

    query = " ".join(sys.argv[1:])
    print(f"\nQuery: {query}\n")

    rag = RAGEngine()
    result = rag.query(query)

    print("=" * 60)
    print("RESPONSE:")
    print("=" * 60)
    print(result['response'])
    print("\n" + "=" * 60)
    print(f"Retrieved {result['metadata']['facts_retrieved']} relevant memories")
    print("=" * 60)

    rag.close()

if __name__ == "__main__":
    main()
