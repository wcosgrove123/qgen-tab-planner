"""
AI Research Assistant Service
FastAPI-based AI agent for market research questionnaire planning
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_load_dotenv

from .agent import ResearchAgent
from .rag_engine import RAGEngine
from .database import get_db
from .config import settings

load_dotenv()

app = FastAPI(
    title="QGEN AI Research Assistant",
    description="AI-powered market research assistant with RAG and project context",
    version="0.1.0"
)

# CORS for web app integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
rag_engine = RAGEngine()
agent = ResearchAgent(rag_engine)


# =========================
# REQUEST/RESPONSE MODELS
# =========================

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    project_id: Optional[str] = None
    session_id: Optional[str] = None
    message: str
    context: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    message: str
    retrieved_contexts: List[Dict[str, Any]]
    suggested_tasks: List[Dict[str, Any]]
    tool_calls: List[Dict[str, Any]]
    tokens_used: int
    model: str


class KnowledgeItem(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str]

class TaskSuggestion(BaseModel):
    title: str
    description: str
    task_type: str
    priority: str
    reasoning: str


# =========================
# API ENDPOINTS
# =========================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "QGEN AI Research Assistant",
        "status": "operational",
        "version": "0.1.0"
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db=Depends(get_db)):
    """
    Main chat endpoint for AI research assistant

    Handles:
    - General market research questions (uses RAG)
    - Project-specific questions (uses project context + RAG)
    - Task suggestions based on conversation
    """
    try:
        response = await agent.process_message(
            message=request.message,
            project_id=request.project_id,
            session_id=request.session_id,
            user_id=request.user_id,
            context=request.context,
            db=db
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.post("/knowledge/add")
async def add_knowledge(item: KnowledgeItem, db=Depends(get_db)):
    """Add new knowledge base entry"""
    try:
        result = await rag_engine.add_knowledge(
            title=item.title,
            content=item.content,
            category=item.category,
            tags=item.tags,
            db=db
        )
        return {"success": True, "id": result["id"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add knowledge: {str(e)}")


@app.get("/knowledge/search")
async def search_knowledge(query: str, limit: int = 5, db=Depends(get_db)):
    """Search knowledge base"""
    try:
        results = await rag_engine.search(query, limit=limit, db=db)
        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/project/{project_id}/context")
async def get_project_context(project_id: str, db=Depends(get_db)):
    """Get full project context for AI"""
    try:
        context = await agent.get_project_context(project_id, db)
        return context

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get context: {str(e)}")


@app.get("/project/{project_id}/tasks")
async def get_project_tasks(project_id: str, status: Optional[str] = None, db=Depends(get_db)):
    """Get AI-suggested tasks for a project"""
    try:
        query = f"SELECT * FROM ai_tasks WHERE project_id = '{project_id}'"
        if status:
            query += f" AND status = '{status}'"

        result = db.execute(query)
        tasks = [dict(row) for row in result]

        return {"tasks": tasks}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tasks: {str(e)}")


@app.post("/project/{project_id}/tasks/{task_id}/update")
async def update_task_status(
    project_id: str,
    task_id: str,
    status: str,
    db=Depends(get_db)
):
    """Update task status (accept, dismiss, complete)"""
    try:
        query = f"""
        UPDATE ai_tasks
        SET status = '{status}', updated_at = NOW()
        WHERE id = '{task_id}' AND project_id = '{project_id}'
        """

        db.execute(query)

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


@app.get("/analytics/usage")
async def get_usage_analytics(
    organization_id: Optional[str] = None,
    days: int = 30,
    db=Depends(get_db)
):
    """Get AI usage analytics"""
    try:
        query = f"""
        SELECT
            operation_type,
            model,
            COUNT(*) as count,
            SUM(tokens_used) as total_tokens,
            SUM(cost_usd) as total_cost,
            AVG(latency_ms) as avg_latency
        FROM ai_usage_log
        WHERE created_at > NOW() - INTERVAL '{days} days'
        """

        if organization_id:
            query += f" AND organization_id = '{organization_id}'"

        query += " GROUP BY operation_type, model ORDER BY total_cost DESC"

        result = db.execute(query)
        analytics = [dict(row) for row in result]

        return {"analytics": analytics}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


# =========================
# STARTUP/SHUTDOWN
# =========================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting AI Research Assistant...")

    # Initialize RAG engine (load embeddings, etc.)
    await rag_engine.initialize()

    print("✅ AI Research Assistant ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down AI Research Assistant...")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
