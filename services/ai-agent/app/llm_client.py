"""
Unified LLM Client supporting OpenAI, Anthropic, and Ollama
"""

import json
import httpx
from typing import List, Dict, Any, Optional
from anthropic import Anthropic
import openai

from .config import settings


class LLMClient:
    """
    Unified interface for calling different LLM providers

    Supports:
    - OpenAI (GPT-4, GPT-3.5)
    - Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
    - Ollama (Llama 3.1, Mistral, Mixtral, Phi-3, etc.)
    """

    def __init__(self, provider: str = None, model: str = None):
        self.provider = provider or settings.DEFAULT_LLM_PROVIDER
        self.model = model or settings.DEFAULT_MODEL

        # Initialize client based on provider
        if self.provider == "anthropic":
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        elif self.provider == "openai":
            openai.api_key = settings.OPENAI_API_KEY
            self.client = None  # Use openai module directly

        elif self.provider == "ollama":
            self.client = None  # HTTP requests via httpx
            self.ollama_base_url = settings.OLLAMA_BASE_URL

        else:
            raise ValueError(f"Unknown provider: {self.provider}")


    async def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str = None,
        tools: List[Dict] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Universal chat interface

        Args:
            messages: List of {role: str, content: str}
            system_prompt: System instructions
            tools: Optional tool definitions
            max_tokens: Maximum response tokens
            temperature: Sampling temperature (0-1)

        Returns:
            {
                "message": str,
                "tool_calls": List[Dict],
                "tokens_used": int,
                "model": str
            }
        """

        if self.provider == "anthropic":
            return await self._chat_anthropic(messages, system_prompt, tools, max_tokens, temperature)

        elif self.provider == "openai":
            return await self._chat_openai(messages, system_prompt, tools, max_tokens, temperature)

        elif self.provider == "ollama":
            return await self._chat_ollama(messages, system_prompt, tools, max_tokens, temperature)


    async def _chat_anthropic(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict],
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Call Anthropic Claude API"""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt or "",
            messages=messages,
            tools=tools or []
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
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
            "model": self.model
        }


    async def _chat_openai(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict],
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Call OpenAI API"""

        # Add system prompt
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        # Convert tools to OpenAI format
        openai_tools = None
        if tools:
            openai_tools = [{"type": "function", "function": tool} for tool in tools]

        response = openai.chat.completions.create(
            model=self.model,
            messages=full_messages,
            tools=openai_tools,
            tool_choice="auto" if tools else None,
            max_tokens=max_tokens,
            temperature=temperature
        )

        message = response.choices[0].message
        tool_calls = []

        if message.tool_calls:
            for tc in message.tool_calls:
                tool_calls.append({
                    "tool": tc.function.name,
                    "input": json.loads(tc.function.arguments)
                })

        return {
            "message": message.content or "",
            "tool_calls": tool_calls,
            "tokens_used": response.usage.total_tokens,
            "model": self.model
        }


    async def _chat_ollama(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict],
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """
        Call Ollama API (local LLM)

        Ollama supports:
        - llama3.1 (8b, 70b, 405b)
        - mistral, mixtral
        - phi3, gemma2
        - qwen2, deepseek-coder
        - And many more!
        """

        # Add system prompt to messages
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        # Build request
        payload = {
            "model": self.model,
            "messages": full_messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }

        # Tool calling for Ollama (experimental - many models don't support it natively)
        # We'll implement a lightweight tool calling wrapper
        if tools:
            # Inject tool definitions into system prompt for better results
            tool_descriptions = "\n\n## Available Tools:\n"
            for tool in tools:
                tool_descriptions += f"- **{tool['name']}**: {tool.get('description', '')}\n"
            tool_descriptions += "\nTo use a tool, respond with JSON: {\"tool\": \"tool_name\", \"input\": {...}}"

            if full_messages[0]["role"] == "system":
                full_messages[0]["content"] += tool_descriptions
            else:
                full_messages.insert(0, {"role": "system", "content": tool_descriptions})

        # Call Ollama
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.ollama_base_url}/api/chat",
                json=payload
            )

            if response.status_code != 200:
                raise Exception(f"Ollama error: {response.text}")

            result = response.json()

        message_content = result["message"]["content"]

        # Parse tool calls from response (if using tool calling)
        tool_calls = []
        if tools:
            tool_calls = self._parse_ollama_tool_calls(message_content, tools)

        # Estimate tokens (Ollama doesn't provide exact token counts)
        estimated_tokens = len(message_content.split()) * 1.3  # Rough approximation

        return {
            "message": message_content,
            "tool_calls": tool_calls,
            "tokens_used": int(estimated_tokens),
            "model": self.model
        }


    def _parse_ollama_tool_calls(self, response: str, tools: List[Dict]) -> List[Dict]:
        """
        Parse tool calls from Ollama response
        (lightweight implementation - models may not follow format perfectly)
        """

        tool_calls = []

        # Try to extract JSON tool calls
        try:
            # Look for JSON blocks in response
            if "{\"tool\":" in response:
                start = response.find("{\"tool\":")
                end = response.find("}", start) + 1
                tool_json = json.loads(response[start:end])

                tool_calls.append(tool_json)

        except json.JSONDecodeError:
            pass  # No valid tool call found

        return tool_calls


    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text

        Supports:
        - OpenAI (text-embedding-ada-002)
        - Ollama (nomic-embed-text, all-minilm, etc.)
        """

        if settings.EMBEDDING_PROVIDER == "openai":
            response = openai.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=text
            )
            return response.data[0].embedding

        elif settings.EMBEDDING_PROVIDER == "ollama":
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                    json={
                        "model": settings.OLLAMA_EMBEDDING_MODEL,
                        "prompt": text
                    }
                )

                if response.status_code != 200:
                    raise Exception(f"Ollama embedding error: {response.text}")

                result = response.json()
                return result["embedding"]

        else:
            raise ValueError(f"Unknown embedding provider: {settings.EMBEDDING_PROVIDER}")
