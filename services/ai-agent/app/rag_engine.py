"""
RAG Engine - Vector search and knowledge retrieval
"""

import openai
from typing import List, Dict, Any
import numpy as np

from .config import settings


class RAGEngine:
    """
    Retrieval-Augmented Generation Engine

    Features:
    - Generate embeddings for queries and documents
    - Vector similarity search in Postgres (pgvector)
    - Hybrid search (vector + full-text)
    - Automatic knowledge base updates
    """

    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.embedding_model = settings.EMBEDDING_MODEL
        self.initialized = False


    async def initialize(self):
        """Initialize RAG engine (load models, etc.)"""
        print("🔍 Initializing RAG engine...")

        # Test embedding generation
        test_embedding = await self._generate_embedding("test")
        if test_embedding:
            print(f"✅ Embedding model ready ({len(test_embedding)} dimensions)")
            self.initialized = True
        else:
            print("❌ Failed to initialize embedding model")


    async def search(
        self,
        query: str,
        limit: int = 5,
        category: str = None,
        threshold: float = None,
        db = None
    ) -> List[Dict[str, Any]]:
        """
        Search knowledge base using vector similarity

        Args:
            query: User's search query
            limit: Maximum number of results
            category: Filter by knowledge category
            threshold: Minimum similarity threshold (0-1)
            db: Supabase client

        Returns:
            List of knowledge base entries with similarity scores
        """

        # Generate embedding for query
        query_embedding = await self._generate_embedding(query)

        if not query_embedding:
            return []

        # Use Supabase function for vector search
        threshold = threshold or settings.RAG_SIMILARITY_THRESHOLD

        result = db.rpc('search_knowledge_base', {
            'query_embedding': query_embedding,
            'match_threshold': threshold,
            'match_count': limit
        }).execute()

        # Filter by category if specified
        results = result.data or []

        if category:
            results = [r for r in results if r['category'] == category]

        return results


    async def add_knowledge(
        self,
        title: str,
        content: str,
        category: str,
        tags: List[str],
        organization_id: str = None,
        db = None
    ) -> Dict[str, Any]:
        """
        Add new knowledge base entry with automatic embedding generation

        Args:
            title: Knowledge item title
            content: Full content text
            category: Category (methodology, questionnaire_design, etc.)
            tags: List of tags for filtering
            organization_id: Optional org ID for private knowledge
            db: Supabase client

        Returns:
            Created knowledge base entry
        """

        # Generate embedding
        combined_text = f"{title}\n\n{content}"
        embedding = await self._generate_embedding(combined_text)

        if not embedding:
            raise Exception("Failed to generate embedding")

        # Insert into database
        result = db.table('knowledge_base').insert({
            'title': title,
            'content': content,
            'category': category,
            'tags': tags,
            'embedding': embedding,
            'organization_id': organization_id,
            'source_type': 'manual',
            'is_active': True
        }).execute()

        return result.data[0] if result.data else {}


    async def update_knowledge_embeddings(self, db = None):
        """
        Regenerate embeddings for all knowledge base entries
        (useful when switching embedding models)
        """

        # Get all knowledge entries without embeddings
        result = db.table('knowledge_base') \
            .select('id, title, content') \
            .is_('embedding', 'null') \
            .execute()

        entries = result.data or []

        print(f"🔄 Updating embeddings for {len(entries)} entries...")

        for entry in entries:
            combined_text = f"{entry['title']}\n\n{entry['content']}"
            embedding = await self._generate_embedding(combined_text)

            if embedding:
                db.table('knowledge_base') \
                    .update({'embedding': embedding}) \
                    .eq('id', entry['id']) \
                    .execute()

        print(f"✅ Updated {len(entries)} embeddings")


    async def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text

        Uses OpenAI's text-embedding-ada-002 by default
        Can be switched to local model (sentence-transformers) for cost savings
        """

        try:
            if self.embedding_model.startswith("text-embedding"):
                # OpenAI embeddings
                response = openai.embeddings.create(
                    model=self.embedding_model,
                    input=text
                )
                return response.data[0].embedding

            else:
                # Local sentence-transformers (future implementation)
                # from sentence_transformers import SentenceTransformer
                # model = SentenceTransformer(self.embedding_model)
                # return model.encode(text).tolist()
                raise NotImplementedError("Local embedding models not yet implemented")

        except Exception as e:
            print(f"❌ Embedding generation failed: {str(e)}")
            return None


    async def hybrid_search(
        self,
        query: str,
        limit: int = 5,
        vector_weight: float = 0.7,
        db = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search combining vector similarity and full-text search

        Args:
            query: Search query
            limit: Max results
            vector_weight: Weight for vector search (0-1), remaining weight for full-text
            db: Supabase client

        Returns:
            Combined results with blended scores
        """

        # Get vector search results
        vector_results = await self.search(query, limit=limit * 2, db=db)

        # Get full-text search results
        fts_result = db.table('knowledge_base') \
            .select('id, title, content, category') \
            .text_search('content', query, config='english') \
            .limit(limit * 2) \
            .execute()

        fts_results = fts_result.data or []

        # Combine and re-rank
        combined = {}

        for i, item in enumerate(vector_results):
            score = (1 - (i / len(vector_results))) * vector_weight
            combined[item['id']] = {**item, 'score': score}

        for i, item in enumerate(fts_results):
            fts_score = (1 - (i / len(fts_results))) * (1 - vector_weight)
            if item['id'] in combined:
                combined[item['id']]['score'] += fts_score
            else:
                combined[item['id']] = {**item, 'score': fts_score}

        # Sort by combined score
        results = sorted(combined.values(), key=lambda x: x['score'], reverse=True)

        return results[:limit]
