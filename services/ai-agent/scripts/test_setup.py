"""
Test script to verify AI agent setup

Checks:
- Database connection
- Ollama connection
- Embedding generation
- Knowledge base search
- Chat functionality
"""

import asyncio
import httpx
from app.config import settings
from app.database import get_db, test_connection
from app.llm_client import LLMClient
from app.rag_engine import RAGEngine


async def test_database():
    """Test Supabase database connection"""
    print("\n🔍 Testing database connection...")

    try:
        if await test_connection():
            print("✅ Database connection successful")

            # Count knowledge base entries
            db = get_db()
            result = db.table('knowledge_base').select('count', count='exact').execute()
            count = result.count

            print(f"✅ Knowledge base has {count} entries")

            if count == 0:
                print("⚠️  No knowledge entries found. Run migration to seed data.")

            return True

        else:
            print("❌ Database connection failed")
            return False

    except Exception as e:
        print(f"❌ Database error: {str(e)}")
        return False


async def test_ollama():
    """Test Ollama connection"""
    print("\n🔍 Testing Ollama connection...")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")

            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [m['name'] for m in models]

                print(f"✅ Ollama connected ({len(models)} models available)")

                # Check for required models
                chat_model = settings.OLLAMA_MODEL
                embedding_model = settings.OLLAMA_EMBEDDING_MODEL

                if chat_model in model_names:
                    print(f"✅ Chat model '{chat_model}' found")
                else:
                    print(f"❌ Chat model '{chat_model}' not found. Run: ollama pull {chat_model}")

                if embedding_model in model_names:
                    print(f"✅ Embedding model '{embedding_model}' found")
                else:
                    print(f"❌ Embedding model '{embedding_model}' not found. Run: ollama pull {embedding_model}")

                return True

            else:
                print(f"❌ Ollama error: {response.status_code}")
                return False

    except httpx.ConnectError:
        print("❌ Ollama not running. Start it with: ollama serve")
        return False

    except Exception as e:
        print(f"❌ Ollama error: {str(e)}")
        return False


async def test_embeddings():
    """Test embedding generation"""
    print("\n🔍 Testing embedding generation...")

    try:
        client = LLMClient()
        embedding = await client.generate_embedding("test market research query")

        if embedding:
            print(f"✅ Embedding generated ({len(embedding)} dimensions)")

            # Verify dimension matches config
            if len(embedding) == settings.EMBEDDING_DIMENSIONS:
                print(f"✅ Embedding dimensions match config ({settings.EMBEDDING_DIMENSIONS})")
            else:
                print(f"⚠️  Dimension mismatch: got {len(embedding)}, expected {settings.EMBEDDING_DIMENSIONS}")
                print(f"   Update EMBEDDING_DIMENSIONS in .env to {len(embedding)}")

            return True

        else:
            print("❌ Failed to generate embedding")
            return False

    except Exception as e:
        print(f"❌ Embedding error: {str(e)}")
        return False


async def test_knowledge_search():
    """Test knowledge base search"""
    print("\n🔍 Testing knowledge base search...")

    try:
        rag = RAGEngine()
        await rag.initialize()

        db = get_db()
        results = await rag.search("banner design best practices", limit=3, db=db)

        if results:
            print(f"✅ Found {len(results)} relevant knowledge entries:")

            for i, result in enumerate(results, 1):
                print(f"   {i}. {result['title']} (similarity: {result['similarity']:.2f})")

            return True

        else:
            print("⚠️  No results found. Knowledge base may be empty.")
            return False

    except Exception as e:
        print(f"❌ Search error: {str(e)}")
        return False


async def test_chat():
    """Test chat functionality"""
    print("\n🔍 Testing chat functionality...")

    try:
        client = LLMClient()

        messages = [
            {"role": "user", "content": "What are best practices for survey question design? Keep it brief."}
        ]

        response = await client.chat(
            messages=messages,
            system_prompt="You are a helpful market research assistant. Keep responses concise.",
            max_tokens=200
        )

        if response and response.get("message"):
            print(f"✅ Chat response received ({response['tokens_used']} tokens)")
            print(f"   Model: {response['model']}")
            print(f"   Response preview: {response['message'][:100]}...")

            return True

        else:
            print("❌ No response from chat")
            return False

    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return False


async def main():
    """Run all tests"""

    print("=" * 60)
    print("🧪 AI Agent Setup Test")
    print("=" * 60)

    results = {
        "database": await test_database(),
        "ollama": await test_ollama(),
        "embeddings": await test_embeddings(),
        "knowledge_search": await test_knowledge_search(),
        "chat": await test_chat()
    }

    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)

    total = len(results)
    passed = sum(1 for v in results.values() if v)

    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! AI agent is ready to use.")
        print("\n🚀 Start the service:")
        print("   poetry run python -m app.main")

    else:
        print("\n⚠️  Some tests failed. Check the errors above and:")
        print("   1. Verify Ollama is running: ollama serve")
        print("   2. Pull required models: ollama pull llama3.1:8b && ollama pull bge-large-en-v1.5")
        print("   3. Check database connection in .env")
        print("   4. Run migrations: cd infra && supabase migration up")


if __name__ == "__main__":
    asyncio.run(main())
