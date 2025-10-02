"""
Research Agent - Core AI logic with tool calling and RAG
"""

import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from anthropic import Anthropic
import openai

from .rag_engine import RAGEngine
from .tools import ResearchTools
from .config import settings


class ResearchAgent:
    """
    AI Research Assistant with:
    - RAG-powered knowledge retrieval
    - Project context awareness
    - Tool calling (read data, suggest tasks)
    - Multi-turn conversation support
    """

    def __init__(self, rag_engine: RAGEngine):
        self.rag_engine = rag_engine
        self.tools = ResearchTools()

        # Initialize LLM client
        if settings.DEFAULT_LLM_PROVIDER == "anthropic":
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = settings.DEFAULT_MODEL
        else:
            openai.api_key = settings.OPENAI_API_KEY
            self.client = None  # Use openai module directly
            self.model = settings.DEFAULT_MODEL

        self.system_prompt = self._build_system_prompt()


    def _build_system_prompt(self) -> str:
        """Build system prompt for the research assistant"""
        return """You are an expert Market Research AI Assistant specializing in questionnaire design,
banner planning, and data analysis.

## Your Capabilities:
1. **Market Research Expertise**: Survey design, sampling, questionnaire validation, data analysis
2. **Banner & Tab Sheet Planning**: Help design crosstab banners with proper equations (e.g., S7=2, S1=18-27)
3. **Project Context**: Access current project questions, banners, and metadata
4. **Task Suggestions**: Proactively identify project issues and suggest actionable tasks

## Your Tools:
- `get_project_context`: Retrieve full project details (questions, banners, metadata)
- `search_knowledge`: Search internal knowledge base for best practices
- `suggest_task`: Create task suggestions for project improvements
- `analyze_banner_structure`: Validate banner equations and structure
- `validate_questionnaire`: Check for common survey design issues

## Response Style:
- Professional, concise, and actionable
- Cite knowledge base sources when providing best practices
- Always consider statistical validity (base sizes, significance)
- Suggest specific improvements with clear reasoning
- Use market research terminology your team understands

## Banner Equation Format:
- Single value: `S7=2` (question S7 equals code 2)
- Range: `S1=18-27` (age range)
- Multiple codes: `Q1=1,2,3` (any of codes 1, 2, or 3)
- Inequality: `Q5>10` or `Q5<=5` (numeric comparisons)

When users ask about their project, ALWAYS use `get_project_context` first to provide accurate,
context-aware answers."""


    async def process_message(
        self,
        message: str,
        project_id: Optional[str] = None,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        db = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate response

        Flow:
        1. Retrieve relevant knowledge from RAG
        2. Get project context if project_id provided
        3. Call LLM with tools
        4. Execute tool calls if needed
        5. Generate final response
        6. Save to chat history
        7. Suggest tasks if appropriate
        """

        # Create or retrieve chat session
        if not session_id:
            session_id = str(uuid.uuid4())
            await self._create_session(session_id, project_id, user_id, db)

        # 1. RAG retrieval
        rag_results = await self.rag_engine.search(message, limit=settings.RAG_TOP_K, db=db)

        # 2. Project context
        project_context = None
        if project_id:
            project_context = await self.get_project_context(project_id, db)

        # 3. Build conversation history
        conversation = await self._get_conversation_history(session_id, db)
        conversation.append({"role": "user", "content": message})

        # 4. Call LLM with tools
        response_data = await self._call_llm(
            conversation=conversation,
            rag_results=rag_results,
            project_context=project_context
        )

        # 5. Save message to history
        await self._save_message(
            session_id=session_id,
            role="user",
            content=message,
            db=db
        )

        await self._save_message(
            session_id=session_id,
            role="assistant",
            content=response_data["message"],
            retrieved_contexts=response_data["retrieved_contexts"],
            tool_calls=response_data["tool_calls"],
            tokens_used=response_data["tokens_used"],
            model=response_data["model"],
            db=db
        )

        # 6. Return formatted response
        return {
            "session_id": session_id,
            "message": response_data["message"],
            "retrieved_contexts": response_data["retrieved_contexts"],
            "suggested_tasks": response_data.get("suggested_tasks", []),
            "tool_calls": response_data["tool_calls"],
            "tokens_used": response_data["tokens_used"],
            "model": response_data["model"]
        }


    async def _call_llm(
        self,
        conversation: List[Dict[str, str]],
        rag_results: List[Dict[str, Any]],
        project_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Call LLM with conversation, RAG context, and tools"""

        # Build context message
        context_parts = []

        if rag_results:
            context_parts.append("## Relevant Knowledge Base:\n")
            for i, result in enumerate(rag_results, 1):
                context_parts.append(
                    f"{i}. **{result['title']}** (Category: {result['category']}, "
                    f"Similarity: {result['similarity']:.2f})\n{result['content']}\n"
                )

        if project_context:
            context_parts.append("\n## Current Project Context:\n")
            context_parts.append(f"**Project**: {project_context['project']['name']}\n")
            context_parts.append(f"**Status**: {project_context['project']['status']}\n")
            context_parts.append(f"**Questions**: {len(project_context.get('questions', []))}\n")

            if project_context.get('questions'):
                context_parts.append("\n### Questions in this project:\n")
                for q in project_context['questions'][:10]:  # Limit to first 10
                    context_parts.append(
                        f"- **{q['id']}**: {q['text']} (Type: {q['type']}, Mode: {q['mode']})\n"
                    )

        # Prepend context as system message
        if context_parts:
            conversation.insert(0, {
                "role": "assistant",
                "content": "".join(context_parts)
            })

        # Call appropriate LLM
        if settings.DEFAULT_LLM_PROVIDER == "anthropic":
            response_data = await self._call_anthropic(conversation)
        else:
            response_data = await self._call_openai(conversation)

        # Add retrieved contexts metadata
        response_data["retrieved_contexts"] = [
            {"id": r["id"], "title": r["title"], "category": r["category"], "similarity": r["similarity"]}
            for r in rag_results
        ]

        return response_data


    async def _call_anthropic(self, conversation: List[Dict[str, str]]) -> Dict[str, Any]:
        """Call Anthropic Claude API"""

        # Define tools for Claude
        tools = [
            {
                "name": "get_project_context",
                "description": "Retrieve full context for a project including questions, banners, metadata",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "Project UUID"}
                    },
                    "required": ["project_id"]
                }
            },
            {
                "name": "suggest_task",
                "description": "Suggest an actionable task for project improvement",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "task_type": {"type": "string", "enum": ["validation", "design_improvement", "data_check", "banner_setup"]},
                        "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]},
                        "reasoning": {"type": "string"}
                    },
                    "required": ["title", "description", "task_type", "priority", "reasoning"]
                }
            }
        ]

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=self.system_prompt,
            messages=conversation,
            tools=tools
        )

        # Extract response
        message_content = ""
        tool_calls = []

        for block in response.content:
            if block.type == "text":
                message_content += block.text
            elif block.type == "tool_use":
                tool_calls.append({
                    "tool": block.name,
                    "input": block.input
                })

        return {
            "message": message_content,
            "tool_calls": tool_calls,
            "suggested_tasks": [tc for tc in tool_calls if tc["tool"] == "suggest_task"],
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
            "model": self.model
        }


    async def _call_openai(self, conversation: List[Dict[str, str]]) -> Dict[str, Any]:
        """Call OpenAI API"""

        # Define tools for OpenAI
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_project_context",
                    "description": "Retrieve full context for a project",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "project_id": {"type": "string"}
                        },
                        "required": ["project_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "suggest_task",
                    "description": "Suggest an actionable task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "task_type": {"type": "string"},
                            "priority": {"type": "string"},
                            "reasoning": {"type": "string"}
                        },
                        "required": ["title", "description", "task_type", "priority", "reasoning"]
                    }
                }
            }
        ]

        response = openai.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": self.system_prompt}] + conversation,
            tools=tools,
            tool_choice="auto"
        )

        message = response.choices[0].message
        tool_calls = []
        suggested_tasks = []

        if message.tool_calls:
            for tc in message.tool_calls:
                tool_data = {
                    "tool": tc.function.name,
                    "input": json.loads(tc.function.arguments)
                }
                tool_calls.append(tool_data)

                if tc.function.name == "suggest_task":
                    suggested_tasks.append(tool_data)

        return {
            "message": message.content or "",
            "tool_calls": tool_calls,
            "suggested_tasks": suggested_tasks,
            "tokens_used": response.usage.total_tokens,
            "model": self.model
        }


    async def get_project_context(self, project_id: str, db) -> Dict[str, Any]:
        """Get full project context from database"""

        # Use Supabase function defined in migration
        result = db.rpc('get_project_context', {'project_uuid': project_id}).execute()

        return result.data if result.data else {}


    async def _create_session(self, session_id: str, project_id: Optional[str], user_id: Optional[str], db):
        """Create new chat session"""

        db.table('chat_sessions').insert({
            'id': session_id,
            'project_id': project_id,
            'person_id': user_id,
            'created_at': datetime.utcnow().isoformat()
        }).execute()


    async def _get_conversation_history(self, session_id: str, db) -> List[Dict[str, str]]:
        """Retrieve conversation history for session"""

        result = db.table('chat_messages') \
            .select('role, content') \
            .eq('session_id', session_id) \
            .order('created_at') \
            .execute()

        return [{"role": msg["role"], "content": msg["content"]} for msg in result.data]


    async def _save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        retrieved_contexts: List[Dict] = None,
        tool_calls: List[Dict] = None,
        tokens_used: int = 0,
        model: str = None,
        db = None
    ):
        """Save message to chat history"""

        db.table('chat_messages').insert({
            'session_id': session_id,
            'role': role,
            'content': content,
            'retrieved_contexts': retrieved_contexts or [],
            'tool_calls': tool_calls or [],
            'tokens_used': tokens_used,
            'model': model,
            'created_at': datetime.utcnow().isoformat()
        }).execute()
