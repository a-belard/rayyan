# Rayyan - AI-Powered Precision Agriculture Platform

Rayyan is an intelligent agricultural advisory system that combines IoT sensors, machine learning, and AI agents to provide data-driven recommendations for irrigation, fertigation, pest management, and crop health monitoring.

## 🌟 Features

- **🤖 AI Agricultural Advisor**: LangGraph-based conversational agent with specialized agricultural tools
- **💧 Smart Irrigation**: Automated irrigation scheduling based on soil moisture, weather, and crop needs
- **🧪 Fertigation Optimization**: NPK ratio recommendations tailored to crop type and growth stage
- **🐛 Pest Detection**: Early pest activity detection with confidence scoring
- **🌱 Soil & Water Analysis**: Real-time monitoring of soil conditions and water quality
- **🌤️ Weather Integration**: Forecast-aware decision making for farm operations
- **📊 Real-time Dashboard**: Next.js frontend with live sensor data and agent chat
- **🔌 Edge Computing**: Lightweight ONNX/TFLite inference on IoT devices

## 🏗️ Architecture

```
├── backend/          # FastAPI API server with LangGraph agent
├── frontend/         # Next.js 15 + React 19 web application
├── edge/             # Edge computing module for IoT devices
├── ml/               # Machine learning models and training
└── infra/            # Infrastructure and deployment configs
```

### Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Supabase (PostgreSQL), LangChain/LangGraph
- **Frontend**: Next.js 15.5, React 19, Tailwind CSS v4, TypeScript
- **AI/LLM**: OpenAI, Anthropic, LangGraph agents
- **Database**: Supabase (PostgreSQL with real-time, auth, storage)
- **Edge**: Python, ONNX Runtime, TFLite, MQTT
- **ML**: PyTorch, TensorFlow, scikit-learn

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/a-belard/rayyan.git
cd rayyan

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit .env files with your Supabase and API keys

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Using Individual Docker Compose Files

Each folder has its own `docker-compose.yml` for independent deployment:

```bash
# Backend only
cd backend && docker-compose up -d

# Frontend only
cd frontend && docker-compose up -d

# Edge only
cd edge && docker-compose up -d

# ML environment only
cd ml && docker-compose up -d
```

See [DOCKER_COMPOSE_INDIVIDUAL.md](DOCKER_COMPOSE_INDIVIDUAL.md) for detailed guide.

### Manual Setup

#### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
uv pip install -e .
python main.py
```

#### Frontend
```bash
cd frontend
cp .env.local.example .env.local
pnpm install
pnpm dev
```

#### Edge Computing
```bash
cd edge
pip install -r requirements.txt
python main.py
```

#### ML Training
```bash
cd ml
pip install -r requirements.txt
jupyter lab
```

See detailed setup instructions in [SETUP_SUPABASE.md](SETUP_SUPABASE.md) and [DOCKER.md](DOCKER.md).

## 📖 Documentation

### Main Guides
- **[SETUP_SUPABASE.md](SETUP_SUPABASE.md)** - Supabase backend setup guide
- **[DOCKER.md](DOCKER.md)** - Complete Docker deployment guide
- **[DOCKER_COMPOSE_INDIVIDUAL.md](DOCKER_COMPOSE_INDIVIDUAL.md)** - Individual service deployment
- **[AGENT_IMPLEMENTATION.md](AGENT_IMPLEMENTATION.md)** - AI agent architecture
- **[AGENT_SUMMARY.md](AGENT_SUMMARY.md)** - Quick reference for agent system
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

### Additional Documentation
- **[docs/docker-compose-individual.md](docs/docker-compose-individual.md)** - Detailed individual service guide
- **[docs/docker-compose-quick-reference.md](docs/docker-compose-quick-reference.md)** - Quick command reference
- **[docs/](docs/)** - Additional technical documentation

## 🤖 AI Agent Usage

The Rayyan AgriAdvisor provides expert agricultural guidance through natural conversation:

```bash
# Example queries:
"Check soil conditions in Zone 1"
"What's the weather forecast for the next 3 days?"
"Calculate irrigation schedule for tomatoes in vegetative stage"
"Recommend fertigation for corn in flowering stage"
"Are there any pest threats detected?"
"Analyze water quality from Well 2"
```

### Available Tools

1. **Weather Forecast** - Rainfall, temperature, evapotranspiration
2. **Soil Analysis** - Moisture %, EC (salinity), pH, nutrients
3. **Water Quality** - EC, pH, RO blending recommendations
4. **Pest Detection** - Species identification, severity, confidence
5. **Irrigation Scheduling** - Timing, duration, volume calculations
6. **Fertigation Recommendations** - NPK ratios, mixing instructions

## 🐳 Docker Deployment

### Build Individual Services
```bash
# Backend
docker build -t rayyan-backend ./backend

# Frontend
docker build -t rayyan-frontend ./frontend

# Edge
docker build -t rayyan-edge ./edge

# ML
docker build -t rayyan-ml ./ml
```

### Using Docker Compose
```bash
# Production stack (backend + frontend + edge)
docker-compose up -d

# With ML environment for training
docker-compose --profile ml up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

See [DOCKER.md](DOCKER.md) for comprehensive Docker guide.

## 🔧 Development

### Backend Development
```bash
cd backend
uv pip install -e .
python main.py  # Runs with auto-reload
```

### Frontend Development
```bash
cd frontend
pnpm install
pnpm dev  # Uses Turbopack for fast HMR
```

### Code Formatting
```bash
# Backend (Python)
black backend/ --line-length=88
isort backend/ --profile=black

# Frontend (TypeScript)
cd frontend
pnpm lint
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
pnpm test
```

## 📊 ML Models

The platform includes modules for:

- **Weather Forecasting**: Time-series prediction models
- **Soil-Water Modeling**: Moisture dynamics and irrigation needs
- **Pest Detection**: Computer vision models (YOLOv8/CNNs)
- **NLU**: Natural language understanding for agent queries
- **Fertigation Optimization**: NPK recommendation engine

Models are exported as ONNX/TFLite for edge deployment.

## 🌐 API Endpoints

### Threads (Conversations)
- `GET /threads` - List all conversation threads
- `POST /threads` - Create new thread
- `GET /threads/{id}` - Get thread details
- `PATCH /threads/{id}` - Update thread
- `DELETE /threads/{id}` - Delete thread

### Agent
- `POST /agent/threads/{id}/run` - Execute agent (SSE streaming)

See full API documentation at `http://localhost:8000/docs` when running.

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.7
CHAT_HISTORY_MAX_MESSAGES=50
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- LangChain/LangGraph for agent framework
- Supabase for backend infrastructure
- Next.js and Vercel for frontend framework
- OpenAI and Anthropic for LLM APIs

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for sustainable agriculture
