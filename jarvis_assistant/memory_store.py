"""
Memory Store with Vector Database
Handles storage and retrieval of facts using embeddings.
"""

import sqlite3
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import openai
from tqdm import tqdm
import config

class MemoryStore:
    """Manage fact storage and vector-based retrieval."""

    def __init__(self):
        """Initialize memory store with vector database."""
        self.db_conn = sqlite3.connect(config.FACTS_DB_PATH)

        # Initialize vector database (Chroma)
        self.chroma_client = chromadb.PersistentClient(
            path=str(config.VECTOR_DB_PATH),
            settings=Settings(anonymized_telemetry=False)
        )

        # Get or create collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="jarvis_memory",
            metadata={"description": "Arunav's WhatsApp chat memory"}
        )

        # Initialize embedding model
        self._init_embedding_model()

    def _init_embedding_model(self):
        """Initialize the embedding model based on configuration."""
        if config.EMBEDDING_PROVIDER == "sentence-transformers":
            print(f"Loading sentence-transformers model: {config.EMBEDDING_MODEL}")
            self.embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)
            self.embed_function = self._embed_with_sentence_transformers
        elif config.EMBEDDING_PROVIDER == "openai":
            openai.api_key = config.OPENAI_API_KEY
            self.embed_function = self._embed_with_openai
            print(f"Using OpenAI embeddings: {config.EMBEDDING_MODEL}")
        else:
            raise ValueError(f"Unknown embedding provider: {config.EMBEDDING_PROVIDER}")

    def _embed_with_sentence_transformers(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using sentence-transformers (local, free)."""
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()

    def _embed_with_openai(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI API."""
        response = openai.embeddings.create(
            input=texts,
            model=config.EMBEDDING_MODEL
        )
        return [item.embedding for item in response.data]

    def load_facts_from_db(self) -> List[Dict]:
        """Load all facts from SQLite database."""
        cursor = self.db_conn.cursor()
        cursor.execute('SELECT id, type, content, source_reference, timestamp FROM facts')
        rows = cursor.fetchall()

        facts = []
        for row in rows:
            facts.append({
                'id': row[0],
                'type': row[1],
                'content': row[2],
                'source_reference': row[3],
                'timestamp': row[4]
            })

        return facts

    def build_vector_index(self, batch_size: int = 100):
        """
        Build vector index from all facts in database.
        This needs to be run after preprocessing.
        """
        print("Building vector index from facts...")

        # Load facts from database
        facts = self.load_facts_from_db()
        print(f"Loaded {len(facts):,} facts from database")

        if len(facts) == 0:
            print("⚠ No facts found in database. Run preprocessing first.")
            return

        # Check if collection already has data
        existing_count = self.collection.count()
        if existing_count > 0:
            print(f"⚠ Collection already contains {existing_count:,} items")
            response = input("Do you want to rebuild the index? (yes/no): ")
            if response.lower() != 'yes':
                print("Skipping index rebuild")
                return
            else:
                # Delete existing collection and recreate
                self.chroma_client.delete_collection("jarvis_memory")
                self.collection = self.chroma_client.get_or_create_collection(
                    name="jarvis_memory",
                    metadata={"description": "Arunav's WhatsApp chat memory"}
                )

        # Process in batches to avoid memory issues
        for i in tqdm(range(0, len(facts), batch_size), desc="Indexing"):
            batch = facts[i:i + batch_size]

            # Prepare data for Chroma
            ids = [str(fact['id']) for fact in batch]
            documents = [fact['content'] for fact in batch]
            metadatas = [{
                'type': fact['type'],
                'source_reference': fact['source_reference'],
                'timestamp': fact['timestamp']
            } for fact in batch]

            # Generate embeddings
            embeddings = self.embed_function(documents)

            # Add to Chroma
            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )

        print(f"✓ Vector index built with {len(facts):,} facts")

    def search(self, query: str, top_k: int = None) -> List[Dict]:
        """
        Search for relevant facts using vector similarity.

        Args:
            query: Search query
            top_k: Number of results to return

        Returns:
            List of relevant facts with similarity scores
        """
        if top_k is None:
            top_k = config.TOP_K_RESULTS

        # Generate query embedding
        query_embedding = self.embed_function([query])[0]

        # Search in Chroma
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        # Format results
        facts = []
        if results['documents'] and len(results['documents'][0]) > 0:
            for i in range(len(results['documents'][0])):
                facts.append({
                    'content': results['documents'][0][i],
                    'type': results['metadatas'][0][i]['type'],
                    'source_reference': results['metadatas'][0][i]['source_reference'],
                    'timestamp': results['metadatas'][0][i]['timestamp'],
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })

        return facts

    def get_stats(self) -> Dict:
        """Get statistics about the memory store."""
        cursor = self.db_conn.cursor()

        # Total facts
        cursor.execute('SELECT COUNT(*) FROM facts')
        total_facts = cursor.fetchone()[0]

        # Facts by type
        cursor.execute('SELECT type, COUNT(*) FROM facts GROUP BY type ORDER BY COUNT(*) DESC')
        facts_by_type = dict(cursor.fetchall())

        # Vector store stats
        vector_count = self.collection.count()

        return {
            'total_facts': total_facts,
            'vector_indexed': vector_count,
            'facts_by_type': facts_by_type
        }

    def close(self):
        """Close database connections."""
        self.db_conn.close()

def main():
    """CLI entry point for building vector index."""
    import sys

    memory = MemoryStore()

    if len(sys.argv) > 1 and sys.argv[1] == "build":
        memory.build_vector_index()
    elif len(sys.argv) > 1 and sys.argv[1] == "stats":
        stats = memory.get_stats()
        print("\n=== Memory Store Statistics ===")
        print(f"Total facts: {stats['total_facts']:,}")
        print(f"Vector indexed: {stats['vector_indexed']:,}")
        print("\nFacts by type:")
        for fact_type, count in stats['facts_by_type'].items():
            print(f"  {fact_type}: {count:,}")
    elif len(sys.argv) > 1 and sys.argv[1] == "search":
        if len(sys.argv) < 3:
            print("Usage: python memory_store.py search <query>")
            sys.exit(1)

        query = " ".join(sys.argv[2:])
        print(f"\nSearching for: {query}\n")

        results = memory.search(query)
        print(f"Found {len(results)} relevant facts:\n")

        for i, fact in enumerate(results, 1):
            print(f"{i}. [{fact['type']}] {fact['content'][:200]}")
            if fact['distance']:
                print(f"   Distance: {fact['distance']:.4f}")
            print()
    else:
        print("Usage:")
        print("  python memory_store.py build   - Build vector index from facts database")
        print("  python memory_store.py stats   - Show memory store statistics")
        print("  python memory_store.py search <query>  - Search for relevant facts")

    memory.close()

if __name__ == "__main__":
    main()
