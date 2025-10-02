# QGEN AI Research Assistant

AI-powered market research assistant with RAG and project context awareness.

## 🚀 Features

- **✅ RAG-Powered Knowledge Base**: Search market research best practices, methodologies, and tips
- **✅ Project-Aware Chat**: Contextual answers about your specific projects
- **✅ Banner Validation**: Automatically validate banner equations and structure
- **✅ Task Suggestions**: AI suggests actionable improvements
- **✅ Multiple LLM Support**: OpenAI, Anthropic Claude, or **Ollama (local/free)**

---

## 🔧 Quick Start

### Option 1: Ollama (Free, Local, Private)

**Best for**: Development, privacy, zero API costs

```bash
# 1. Install Ollama
# Windows: Download from https://ollama.com/download
# Mac: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull models
ollama pull llama3.1:8b          # Main chat model (4.7GB)
ollama pull nomic-embed-text     # Embeddings (274MB)

# 3. Start Ollama service (runs in background)
ollama serve

# 4. Install Python dependencies
cd services/ai-agent
pip install poetry
poetry install

# 5. Configure
cp .env.example .env
# Edit .env:
# DEFAULT_LLM_PROVIDER=ollama
# OLLAMA_MODEL=llama3.1:8b
# EMBEDDING_PROVIDER=ollama

# 6. Run the service
poetry run python -m app.main
```

**Recommended Ollama Models:**
- **Chat**: `llama3.1:8b` (balanced), `mistral:7b` (fast), `mixtral:8x7b` (powerful)
- **Embeddings**: `nomic-embed-text` (best), `all-minilm` (faster)

---

### Option 2: OpenAI (Paid, Cloud)

**Best for**: Production, highest quality

```bash
# 1. Get API key from https://platform.openai.com/api-keys

# 2. Configure
cp .env.example .env
# Edit .env:
# DEFAULT_LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-...
# DEFAULT_MODEL=gpt-4-turbo

# 3. Run
poetry install
poetry run python -m app.main
```

---

### Option 3: Anthropic Claude (Paid, Cloud)

**Best for**: Complex reasoning, long context

```bash
# 1. Get API key from https://console.anthropic.com/

# 2. Configure
cp .env.example .env
# Edit .env:
# DEFAULT_LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-...
# DEFAULT_MODEL=claude-sonnet-3.5

# 3. Run
poetry install
poetry run python -m app.main
```

---

## 📊 Database Setup

Run the migration to add AI tables:

```bash
# From project root
cd infra
supabase migration up
```

This creates:
- `knowledge_base` - Market research tips and best practices
- `chat_sessions` - Conversation history
- `chat_messages` - Individual messages
- `ai_tasks` - AI-suggested tasks
- `ai_usage_log` - Usage analytics

---

## 🧪 Testing the API

```bash
# Start the service
poetry run python -m app.main

# Test endpoints
curl http://localhost:8001/

# Chat (general question)
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are best practices for survey question design?"
  }'

# Chat (project-specific)
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-uuid",
    "message": "Analyze the banners in this project"
  }'

# Search knowledge base
curl "http://localhost:8001/knowledge/search?query=banner+design&limit=3"
```

---

## 🎨 Frontend Integration

Add chat interface to your web app:

```javascript
// apps/web/src/services/aiAgent.js
import { supabase } from '@/lib/supa.js';

const AI_API_BASE = 'http://localhost:8001';

export async function chatWithAI(message, projectId = null) {
  const response = await fetch(`${AI_API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      project_id: projectId,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
  });

  return await response.json();
}

export async function getProjectTasks(projectId) {
  const response = await fetch(`${AI_API_BASE}/project/${projectId}/tasks`);
  return await response.json();
}
```

Add chat UI component:

```javascript
// apps/web/src/components/AIChatPanel.js
export function renderAIChatPanel(projectId) {
  return `
    <div class="ai-chat-panel">
      <div class="chat-header">
        <h3>🤖 Research Assistant</h3>
      </div>

      <div class="chat-messages" id="ai-chat-messages">
        <!-- Messages appear here -->
      </div>

      <div class="chat-input">
        <input
          type="text"
          id="ai-chat-input"
          placeholder="Ask about this project..."
        />
        <button onclick="sendAIMessage()">Send</button>
      </div>
    </div>
  `;
}

async function sendAIMessage() {
  const input = document.getElementById('ai-chat-input');
  const message = input.value.trim();

  if (!message) return;

  // Add user message to UI
  addMessageToChat('user', message);

  // Clear input
  input.value = '';

  // Call AI
  const response = await chatWithAI(message, currentProjectId);

  // Add AI response
  addMessageToChat('assistant', response.message);

  // Display suggested tasks if any
  if (response.suggested_tasks.length > 0) {
    displaySuggestedTasks(response.suggested_tasks);
  }
}
```

---

## 📚 Knowledge Base Management

Add custom knowledge:

```bash
curl -X POST http://localhost:8001/knowledge/add \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Custom Survey Tip",
    "content": "When designing scales, use 5 or 7 points for optimal discrimination...",
    "category": "questionnaire_design",
    "tags": ["scales", "best_practices"]
  }'
```

Or add via Python script:

```python
from app.rag_engine import RAGEngine
from app.database import get_db

rag = RAGEngine()
db = get_db()

await rag.add_knowledge(
    title="Banner Design for Pharma Studies",
    content="In pharmaceutical research, common banners include...",
    category="banner_tips",
    tags=["pharma", "banners", "healthcare"],
    db=db
)
```

---

## 🔬 Advanced: Custom Tools

Add custom tools for the agent:

```python
# app/tools.py

class ResearchTools:

    @staticmethod
    def estimate_field_time(questions: List[Dict]) -> Dict:
        """Estimate survey completion time"""

        total_seconds = 0

        for q in questions:
            qmode = q.get("question_mode")

            # Rough time estimates
            if qmode == "list":
                total_seconds += 5
            elif qmode == "scale":
                total_seconds += 3
            elif qmode == "table":
                total_seconds += 10
            elif qmode == "open":
                total_seconds += 30

        minutes = total_seconds / 60

        return {
            "estimated_minutes": round(minutes, 1),
            "recommendation": "Aim for 10-15 minutes" if minutes > 15 else "Good length"
        }
```

---

## 🚀 Deployment (Production)

### Docker Deployment

```dockerfile
# services/ai-agent/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev

COPY app ./app

EXPOSE 8001

CMD ["poetry", "run", "python", "-m", "app.main"]
```

```bash
# Build and run
docker build -t qgen-ai-agent .
docker run -p 8001:8001 --env-file .env qgen-ai-agent
```

### Environment Variables (Production)

```bash
# .env.production
DEFAULT_LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-prod-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
DATABASE_URL=postgresql://...
```

---

## 💰 Cost Estimates

### Ollama (Free)
- **Cost**: $0
- **Speed**: Fast (local GPU/CPU)
- **Privacy**: Complete (never leaves your machine)

### OpenAI
- **GPT-4 Turbo**: ~$0.01 per chat message
- **Embeddings**: ~$0.0001 per knowledge base entry

### Anthropic
- **Claude Sonnet 3.5**: ~$0.003 per chat message
- **Embeddings**: Use OpenAI or Ollama

---

## 🐛 Troubleshooting

### Ollama not connecting

```bash
# Check if Ollama is running
ollama list

# Test embedding generation
curl http://localhost:11434/api/embeddings \
  -d '{"model": "nomic-embed-text", "prompt": "test"}'
```

### Database connection issues

```python
# Test connection
from app.database import test_connection
await test_connection()
```

### Slow responses

- **Ollama**: Try smaller models (`mistral:7b` vs `mixtral:8x7b`)
- **Cloud APIs**: Check network latency
- **Reduce RAG_TOP_K**: Set to 3 instead of 5

---

## 📖 API Reference

See full API documentation:

```bash
# Start server
poetry run python -m app.main

# Open in browser
http://localhost:8001/docs  # Swagger UI
```

---

## 🎯 Roadmap

### Phase 1: Chat Assistant ✅ (Current)
- [x] RAG knowledge base
- [x] Project context awareness
- [x] Task suggestions
- [x] Ollama support

### Phase 2: Auto-Generation (Next)
- [ ] Generate questionnaires from natural language
- [ ] Auto-suggest banner structures
- [ ] Generate tab sheets from banners

### Phase 3: Analysis Assistant
- [ ] Analyze SPSS data
- [ ] Suggest data tables
- [ ] Generate insights from crosstabs

---

## 🤝 Contributing

To add new knowledge categories or tools, see:
- `app/tools.py` - Add custom tools
- `infra/supabase/migrations/0005_ai_agent_system.sql` - Update knowledge base seeds

---

**Questions? Issues?** Open a GitHub issue or ask the AI assistant! 🤖
