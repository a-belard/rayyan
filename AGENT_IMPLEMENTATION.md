# Agricultural Advisory Agent - Implementation Guide

## 🎯 Overview

We've implemented a complete agricultural advisory AI agent system inspired by the risknav chatbot architecture. The agent provides intelligent, data-driven recommendations for precision agriculture covering:

- 🌦️ Weather-based planning and irrigation scheduling
- 💧 Water quality analysis and fertigation optimization
- 🌱 Soil health monitoring and nutrient management
- 🐛 Pest detection and control strategies
- 📊 Real-time decision support with traffic-light indicators

## 🏗️ Architecture

### Backend (FastAPI + LangGraph)

```
backend/
├── agent/                      # Agent core
│   ├── system_prompt.py       # Agent role and instructions
│   ├── tools.py               # Agricultural analysis tools
│   ├── llm_config.py          # LLM initialization
│   └── builder.py             # Agent graph builder
├── routers/                    # API endpoints
│   ├── threads.py             # Thread CRUD operations
│   └── agent.py               # Agent streaming execution
├── models.py                   # Database models (Thread, Message, Run)
├── config.py                   # Settings with AI configuration
├── db.py                       # Supabase + SQLAlchemy setup
└── main.py                     # FastAPI app with routers
```

### Frontend (Next.js 15 + React 19)

```
frontend/src/
├── app/chat/
│   └── page.tsx               # Main chat interface
└── components/chat/
    ├── ChatMessage.tsx        # Message display component
    ├── ChatInput.tsx          # Input field with send button
    └── ThreadList.tsx         # Conversation history sidebar
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies (imports will resolve after this)
uv pip install -e .

# Configure environment
cp .env.example .env

# Edit .env with your keys:
# - SUPABASE_URL, SUPABASE_KEY, DATABASE_URL
# - OPENAI_API_KEY (required) or ANTHROPIC_API_KEY
# - DEFAULT_LLM_MODEL=gpt-4o-mini (or gpt-4o, claude-3-5-sonnet-20241022)

# Run the backend
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Chat API**: http://localhost:8000/api/v1/agent/threads/{thread_id}/run

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the frontend
pnpm dev
```

Visit http://localhost:3000/chat to use the agent!

## 🤖 Agent Capabilities

### Agricultural Tools

The agent has access to 7 specialized tools:

1. **`reason_step(title, detail)`**
   - Record thinking process before/after tool calls
   - Provides transparency in decision making

2. **`get_weather_forecast(location, days=7)`**
   - Retrieves rainfall, temperature, humidity, ET₀
   - Helps plan irrigation based on weather

3. **`analyze_soil_conditions(zone_id)`**
   - Checks moisture (%), EC (salinity), pH
   - Returns traffic-light status indicators
   - Provides immediate recommendations

4. **`analyze_water_quality(source_id)`**
   - Assesses water EC, pH
   - Suggests RO blending ratios
   - Quality ratings: 🟢 Excellent, 🟡 Acceptable, 🟠 Poor

5. **`detect_pest_activity(zone_id)`**
   - ML-based pest detection (to be integrated)
   - Species identification and severity rating
   - Immediate action recommendations

6. **`calculate_irrigation_schedule(zone_id, crop_type, growth_stage)`**
   - Optimal irrigation timing and duration
   - Considers crop stage (seedling → fruiting)
   - Water amount calculations

7. **`recommend_fertigation(crop_type, growth_stage)`**
   - NPK ratios for growth stage
   - Mixing instructions and EC targets
   - Application frequency guidance

### Example Queries

Try asking the agent:

```
"What should my irrigation schedule be for tomatoes in the fruiting stage?"

"The EC in Zone 3 is 2.4 dS/m. What should I do?"

"We detected unusual sounds in the field. Can you check for pests?"

"What's the weather forecast for the next week and how should I adjust watering?"

"My lettuce is in the vegetative stage. What fertilizer ratio should I use?"
```

## 🔧 API Endpoints

### Thread Management

```http
GET    /api/v1/threads/?user_id={user_id}
POST   /api/v1/threads/?user_id={user_id}
GET    /api/v1/threads/{thread_id}?user_id={user_id}
PATCH  /api/v1/threads/{thread_id}?user_id={user_id}
DELETE /api/v1/threads/{thread_id}?user_id={user_id}
```

### Agent Execution

```http
# Get messages
GET  /api/v1/agent/threads/{thread_id}/messages?user_id={user_id}

# Run agent (SSE streaming)
POST /api/v1/agent/threads/{thread_id}/run
Body: { "content": "your question", "user_id": "user-id" }
```

### SSE Event Types

The agent streaming endpoint emits:

- **`token`**: Streamed text tokens from LLM
- **`reasoning`**: Agent's thinking process
- **`tool_start`**: Tool being called with input
- **`tool_end`**: Tool results
- **`done`**: Complete response with message ID
- **`error`**: Error message if something fails

## 📊 Database Schema

### Thread
```sql
id (uuid), user_id (string), title (string?), is_pinned (bool),
metadata (jsonb), last_message_at (timestamp), created_at, updated_at
```

### Message
```sql
id (uuid), thread_id (fk), position (int), role (enum),
content (text), metadata (jsonb), created_at
```

### Run
```sql
id (uuid), thread_id (fk), status (enum), metadata (jsonb),
started_at, completed_at, created_at
```

## 🎨 Frontend Features

### Chat Interface

- **Thread Sidebar**: Conversation history with message counts and timestamps
- **New Conversation**: Create new threads on demand
- **Streaming Responses**: Real-time token streaming with "typing..." indicator
- **Message Formatting**: Styled user/assistant messages with emoji indicators
- **Tool Call Display**: Expandable details showing which tools were used
- **Responsive Design**: Mobile-friendly Tailwind CSS layout

### User Experience

- Traffic-light indicators: 🟢 Good, 🟡 Caution, 🔴 Alert
- Emoji icons for context: 🌾 AgriAdvisor, 🌧️ Weather, 💧 Water, etc.
- Auto-scroll to latest messages
- Disabled input while agent is thinking
- Graceful error handling

## 🔌 Integration Points

### Current (Simulated Data)

The tools currently return simulated data with realistic values. This demonstrates the full system working end-to-end.

### Future Integrations

To connect real data sources, update these functions in `backend/agent/tools.py`:

1. **Weather**: Integrate OpenWeatherMap, Visual Crossing, or NOAA APIs
2. **Soil Sensors**: Connect to IoT platform or Supabase tables with sensor data
3. **Water Quality**: Read from lab test results or inline sensors
4. **Pest Detection**: Deploy ML model (CNN on spectrograms) from `ml/pest_detection/`
5. **Irrigation**: Connect to valve controllers or scheduling systems

Example integration pattern:

```python
@tool
async def analyze_soil_conditions(zone_id: str) -> Dict[str, Any]:
    # Real implementation
    from supabase import get_supabase_client
    supabase = get_supabase_client()
    
    # Query latest sensor reading
    result = supabase.table('sensor_readings')\
        .select('*')\
        .eq('zone_id', zone_id)\
        .order('timestamp', desc=True)\
        .limit(1)\
        .execute()
    
    data = result.data[0] if result.data else None
    # ... process and return
```

## 🧪 Testing

### Test Agent Locally

```bash
# Start backend
cd backend && python main.py

# In another terminal, test with curl
curl -N -X POST http://localhost:8000/api/v1/agent/threads/{thread_id}/run \
  -H "Content-Type: application/json" \
  -d '{"content": "What irrigation schedule for tomatoes?", "user_id": "demo-user"}'
```

### Test Frontend

```bash
cd frontend && pnpm dev
# Visit http://localhost:3000/chat
# Create a new conversation
# Ask: "Check soil conditions in Zone 1"
```

## 📝 LLM Configuration

### Supported Providers

- **OpenAI**: gpt-4o-mini (recommended for speed/cost), gpt-4o (best quality)
- **Anthropic**: claude-3-5-sonnet-20241022, claude-3-opus

### Switching Models

Edit `.env`:

```bash
DEFAULT_LLM_PROVIDER=openai  # or "anthropic"
DEFAULT_LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.7  # 0-1, lower = more deterministic
LLM_MAX_TOKENS=2000
```

## 🎯 Next Steps

### Phase 1: Data Integration (Current)
- ✅ Agent architecture implemented
- ✅ Chat UI with streaming
- ⏳ Connect real sensor data from Supabase
- ⏳ Integrate weather APIs
- ⏳ Deploy pest detection ML model

### Phase 2: Advanced Features
- User authentication (Supabase Auth)
- Farm/zone management UI
- Sensor data visualization dashboard
- Historical trend analysis
- Multi-language support

### Phase 3: Edge Computing
- Deploy lightweight models to edge devices
- MQTT integration for IoT sensors
- Offline decision support
- Real-time alerts via SMS/push notifications

### Phase 4: Policy Maker Tools
- Regional aggregation dashboard
- Pest outbreak heat maps
- Water allocation planning
- Crop stress monitoring
- Early warning systems

## 🐛 Troubleshooting

### Backend Issues

**Import errors**: Run `uv pip install -e .` in backend directory

**Database errors**: Check DATABASE_URL format (must use `postgresql+asyncpg://`)

**LLM errors**: Verify API keys in `.env` and check provider/model name

### Frontend Issues

**API connection**: Verify `NEXT_PUBLIC_API_URL` in `.env.local`

**Streaming not working**: Check CORS settings in backend `main.py`

**Build errors**: Run `pnpm install` and check Node.js version (18+)

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Tools](https://python.langchain.com/docs/modules/agents/tools/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## 🤝 Contributing

When extending the agent:

1. **New Tools**: Add to `backend/agent/tools.py` with clear docstrings
2. **System Prompt**: Update `backend/agent/system_prompt.py` for new capabilities
3. **Frontend**: Add specialized UI components in `frontend/src/components/`
4. **Database**: Create migrations for schema changes

Follow the existing patterns for consistency!
