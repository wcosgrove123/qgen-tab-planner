"""
Configuration settings for AI Agent
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # LLM Configuration
    DEFAULT_LLM_PROVIDER: str = "ollama"  # 'openai', 'anthropic', or 'ollama'
    DEFAULT_MODEL: str = "llama3.1:8b"  # or 'gpt-4-turbo', 'claude-sonnet-3.5'

    # API Keys (optional if using Ollama)
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"  # or 'mistral', 'mixtral', 'phi3', etc.
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"  # Local embeddings

    # Supabase
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:54322/postgres"

    # Embedding Configuration
    EMBEDDING_PROVIDER: str = "ollama"  # 'openai' or 'ollama'
    EMBEDDING_MODEL: str = "bge-large-en-v1.5"  # or 'nomic-embed-text', 'text-embedding-ada-002'
    EMBEDDING_DIMENSIONS: int = 1024  # BGE: 1024, OpenAI: 1536, nomic: 768

    # RAG Settings
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.7

    # Agent Configuration
    MAX_TOOL_ITERATIONS: int = 5
    ENABLE_TASK_SUGGESTIONS: bool = True
    ENABLE_PROJECT_CONTEXT: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
