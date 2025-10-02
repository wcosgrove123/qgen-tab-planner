"""
Regenerate embeddings for all knowledge base entries

Use this when switching embedding models or dimensions
"""

import asyncio
from app.rag_engine import RAGEngine
from app.database import get_db, test_connection


async def main():
    """Regenerate all embeddings"""

    print("🔄 Regenerating embeddings for knowledge base...")

    # Test connection first
    if not await test_connection():
        print("❌ Database connection failed. Check your configuration.")
        return

    # Initialize RAG engine
    rag = RAGEngine()
    await rag.initialize()

    # Get database connection
    db = get_db()

    # Regenerate embeddings
    await rag.update_knowledge_embeddings(db)

    print("✅ Done! All embeddings regenerated.")


if __name__ == "__main__":
    asyncio.run(main())
