# Embedding Models Reference

Choose the right embedding model for your use case.

## 🎯 Recommended Models

### BGE (BAAI General Embedding) - **Recommended** ⭐

**Best for**: High accuracy, balanced performance, local deployment

```bash
# Install via Ollama
ollama pull bge-large-en-v1.5  # 1024 dimensions, 335MB

# Or use smaller variants
ollama pull bge-base-en-v1.5   # 768 dimensions, 223MB
ollama pull bge-small-en-v1.5  # 384 dimensions, 133MB
```

**Configuration**:
```env
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=bge-large-en-v1.5
EMBEDDING_DIMENSIONS=1024
```

**Performance**:
- ✅ Top-tier accuracy on MTEB benchmark
- ✅ Fast inference
- ✅ Excellent for domain-specific text (market research)
- ✅ Completely free and private

---

### Nomic Embed Text

**Best for**: Fastest local inference, lower memory

```bash
ollama pull nomic-embed-text  # 768 dimensions, 274MB
```

**Configuration**:
```env
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSIONS=768
```

**Performance**:
- ✅ Extremely fast
- ✅ Low memory usage
- ✅ Good accuracy
- ⚠️ Slightly lower quality than BGE for specialized domains

---

### OpenAI (text-embedding-ada-002)

**Best for**: Production, ease of use, highest quality

```env
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_DIMENSIONS=1536
OPENAI_API_KEY=sk-...
```

**Performance**:
- ✅ Excellent accuracy
- ✅ No setup required
- ❌ Costs ~$0.0001 per 1K tokens
- ❌ Data sent to OpenAI (privacy concern)

---

## 📊 Performance Comparison

| Model | Dimensions | Size | Speed | Accuracy | Cost |
|-------|------------|------|-------|----------|------|
| **bge-large-en-v1.5** | 1024 | 335MB | Fast | ⭐⭐⭐⭐⭐ | Free |
| **bge-base-en-v1.5** | 768 | 223MB | Faster | ⭐⭐⭐⭐ | Free |
| **nomic-embed-text** | 768 | 274MB | Fastest | ⭐⭐⭐⭐ | Free |
| **OpenAI ada-002** | 1536 | N/A | Medium | ⭐⭐⭐⭐⭐ | $0.0001/1K |

---

## 🔧 Switching Models

### Step 1: Update Configuration

Edit `.env`:
```env
EMBEDDING_DIMENSIONS=1024  # Match your model
```

### Step 2: Update Database Schema

```sql
-- Update vector column dimension
ALTER TABLE knowledge_base
  ALTER COLUMN embedding TYPE vector(1024);

-- Recreate search function with new dimension
DROP FUNCTION IF EXISTS search_knowledge_base;

CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1024),  -- Update dimension here
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_active = TRUE
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Step 3: Regenerate Embeddings

```bash
# Via API
curl -X POST http://localhost:8001/knowledge/regenerate-embeddings

# Or via Python
poetry run python scripts/regenerate_embeddings.py
```

---

## 🧪 Testing Embeddings

```python
# Test embedding generation
from app.llm_client import LLMClient
from app.config import settings

client = LLMClient()

embedding = await client.generate_embedding("test market research query")

print(f"Embedding dimensions: {len(embedding)}")  # Should match EMBEDDING_DIMENSIONS
print(f"First 5 values: {embedding[:5]}")
```

---

## 💡 Tips

### For Maximum Accuracy
- Use **bge-large-en-v1.5** (1024 dim)
- Increase RAG_TOP_K to 7-10 for more context

### For Speed
- Use **nomic-embed-text** (768 dim)
- Keep RAG_TOP_K at 3-5

### For Production
- Use **OpenAI ada-002** (1536 dim)
- Enable caching for frequently searched queries

### For Privacy
- Use **any local model** (BGE or nomic)
- Never send embeddings off-premise

---

## 📚 Model Details

### BGE Models

**Source**: [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5)

**Variants**:
- `bge-large-en-v1.5` - 1024 dim, best accuracy
- `bge-base-en-v1.5` - 768 dim, balanced
- `bge-small-en-v1.5` - 384 dim, fastest

**Training**: General-purpose embeddings trained on massive corpus including academic, web, and code text.

### Nomic Embed Text

**Source**: [nomic-ai/nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1)

**Dimensions**: 768
**Training**: Contrastive learning on diverse text corpus

---

## 🔐 Security Note

Local models (BGE, nomic) mean:
- ✅ All embeddings generated on-premise
- ✅ No data sent to third parties
- ✅ Full HIPAA/GDPR compliance
- ✅ No API rate limits

OpenAI means:
- ⚠️ Data sent to OpenAI for embedding
- ⚠️ Subject to OpenAI's data retention policy
- ⚠️ API rate limits apply

For sensitive market research data, **always use local models**.
