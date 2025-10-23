#!/usr/bin/env python3
"""
Jarvis - Personal AI Assistant
Main CLI interface for interacting with your RAG-powered AI assistant.
"""

import sys
from typing import Optional
import readline  # For better input editing
from rag_engine import RAGEngine
import config

class JarvisAssistant:
    """Main assistant interface."""

    def __init__(self):
        """Initialize Jarvis assistant."""
        print("🤖 Initializing Jarvis...")
        config.validate_config()

        self.rag = RAGEngine()
        self.rag.load_conversation_history()

        print(f"✓ Jarvis ready for {config.USER_NAME}")
        print(f"✓ Memory loaded: {self.rag.memory.collection.count():,} facts indexed")
        print()

    def print_help(self):
        """Print help message."""
        print("""
Available commands:
  /help       - Show this help message
  /stats      - Show memory statistics
  /history    - Show recent conversation history
  /clear      - Clear conversation history
  /exit       - Exit Jarvis

Ask anything about yourself, get advice, or have a conversation!
        """)

    def handle_command(self, command: str) -> bool:
        """
        Handle special commands.

        Returns:
            True if should continue, False if should exit
        """
        command = command.strip().lower()

        if command == "/exit" or command == "/quit":
            return False

        elif command == "/help":
            self.print_help()

        elif command == "/stats":
            stats = self.rag.memory.get_stats()
            print("\n=== Memory Statistics ===")
            print(f"Total facts: {stats['total_facts']:,}")
            print(f"Vector indexed: {stats['vector_indexed']:,}")
            print("\nFacts by type:")
            for fact_type, count in stats['facts_by_type'].items():
                print(f"  {fact_type}: {count:,}")
            print()

        elif command == "/history":
            if not self.rag.conversation_history:
                print("\nNo conversation history yet.\n")
            else:
                print("\n=== Recent Conversations ===")
                for i, turn in enumerate(self.rag.conversation_history[-10:], 1):
                    print(f"\n{i}. Q: {turn['query']}")
                    print(f"   A: {turn['response'][:150]}...")
                print()

        elif command == "/clear":
            self.rag.clear_conversation_history()

        else:
            print(f"Unknown command: {command}")
            print("Type /help for available commands")

        return True

    def run_interactive(self):
        """Run interactive CLI mode."""
        print("=" * 60)
        print(f"  JARVIS - Personal AI Assistant for {config.USER_NAME}")
        print("=" * 60)
        print("\nType /help for commands or start asking questions!")
        print("Press Ctrl+C or type /exit to quit\n")

        try:
            while True:
                # Get user input
                try:
                    user_input = input(f"\n{config.USER_NAME}: ").strip()
                except EOFError:
                    break

                if not user_input:
                    continue

                # Handle commands
                if user_input.startswith('/'):
                    should_continue = self.handle_command(user_input)
                    if not should_continue:
                        break
                    continue

                # Process query
                print("\nJarvis: ", end='', flush=True)

                try:
                    result = self.rag.query(user_input)
                    print(result['response'])

                    # Show metadata in verbose mode
                    if '--verbose' in sys.argv:
                        print(f"\n[Retrieved {result['metadata']['facts_retrieved']} memories]")

                except Exception as e:
                    print(f"\n⚠ Error: {str(e)}")
                    print("Please try again or check your API configuration.")

        except KeyboardInterrupt:
            print("\n")

        finally:
            self.cleanup()

    def run_single_query(self, query: str):
        """Run a single query and exit."""
        try:
            result = self.rag.query(query)
            print(result['response'])

            if '--verbose' in sys.argv:
                print(f"\n[Model: {result['metadata']['model']}]")
                print(f"[Retrieved {result['metadata']['facts_retrieved']} memories]")

        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
        finally:
            self.cleanup()

    def cleanup(self):
        """Clean up resources."""
        print("\n👋 Goodbye!")
        self.rag.close()

def main():
    """Main entry point."""
    if len(sys.argv) > 1 and sys.argv[1] not in ['--verbose']:
        # Single query mode
        query = " ".join(arg for arg in sys.argv[1:] if not arg.startswith('--'))
        assistant = JarvisAssistant()
        assistant.run_single_query(query)
    else:
        # Interactive mode
        assistant = JarvisAssistant()
        assistant.run_interactive()

if __name__ == "__main__":
    main()
