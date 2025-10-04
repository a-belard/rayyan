# Docker Compose Quick Reference

## 📂 Available Docker Compose Files

```
rayyan/
├── docker-compose.yml              # Root: All services orchestrated
├── backend/docker-compose.yml      # Backend API only
├── frontend/docker-compose.yml     # Frontend web app only
├── edge/docker-compose.yml         # Edge computing only
└── ml/docker-compose.yml           # ML training only
```

## 🚀 Quick Commands

### Root-Level (All Services)

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d backend frontend

# With ML environment
docker-compose --profile ml up -d

# Stop all
docker-compose down
```

### Backend (API Server)

```bash
cd backend
docker-compose up -d                 # Start
docker-compose logs -f              # View logs
docker-compose exec backend bash    # Enter container
docker-compose down                 # Stop
```

**Access:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Frontend (Web App)

```bash
cd frontend
docker-compose up -d                 # Start
docker-compose logs -f              # View logs
docker-compose exec frontend sh     # Enter container
docker-compose down                 # Stop
```

**Access:**
- Web: http://localhost:3000

### Edge (IoT Module)

```bash
cd edge
docker-compose up -d                 # Start
docker-compose logs -f              # View logs
docker-compose exec edge bash       # Enter container
docker-compose down                 # Stop
```

**Access:**
- API: http://localhost:5000

### ML (Training)

```bash
cd ml
docker-compose up -d                 # Start
docker-compose logs -f              # View logs
docker-compose exec ml bash         # Enter container
docker-compose down                 # Stop
```

**Access:**
- Jupyter: http://localhost:8888 (token: rayyan)

## 📋 Common Tasks

### View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Specific service
docker-compose logs --tail=100      # Last 100 lines
```

### Rebuild
```bash
docker-compose up -d --build        # Rebuild and restart
docker-compose build --no-cache     # Clean rebuild
```

### Status
```bash
docker-compose ps                   # Running services
docker-compose top                  # Processes
```

### Execute Commands
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec frontend pnpm install
docker-compose exec ml jupyter notebook list
```

### Clean Up
```bash
docker-compose down                 # Stop containers
docker-compose down -v              # Stop + remove volumes
docker-compose down --rmi all       # Stop + remove images
```

## 🔧 Environment Setup

### Backend
```bash
cd backend
cp .env.example .env
# Edit: SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit: NEXT_PUBLIC_API_URL
```

### Edge
```bash
cd edge
cp .env.example .env
# Edit: MQTT_BROKER, BACKEND_API_URL
```

### ML
```bash
cd ml
cp .env.example .env
# Edit: JUPYTER_TOKEN
```

## 🎯 Deployment Patterns

### Pattern 1: Monolithic (All-in-One)
```bash
# From root
docker-compose up -d
```

### Pattern 2: Microservices (Separate)
```bash
# Terminal 1
cd backend && docker-compose up -d

# Terminal 2
cd frontend && docker-compose up -d

# Terminal 3
cd edge && docker-compose up -d
```

### Pattern 3: Development Stack
```bash
# From root
docker-compose up -d backend frontend
docker-compose --profile ml up -d
```

## 🔍 Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000/

# Check all
docker-compose ps
```

## 🐛 Troubleshooting

### Port conflict
```bash
# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead of 8000
```

### Container won't start
```bash
docker-compose logs backend
docker-compose up --build
```

### Network issues
```bash
docker-compose down
docker network prune
docker-compose up -d
```

### Reset everything
```bash
docker-compose down -v --rmi all
docker system prune -a
```

## 📚 Documentation

- **[DOCKER.md](../DOCKER.md)** - Complete Docker guide
- **[docs/docker-compose-individual.md](docker-compose-individual.md)** - Individual service guide
- **[DOCKER_SETUP.md](../DOCKER_SETUP.md)** - Setup summary
- **[README.md](../README.md)** - Project overview

## 🎨 Tips

1. **Use `docker-compose ps`** to check service status
2. **Use `docker-compose logs -f`** for real-time logs
3. **Always set environment variables** before starting
4. **Use `--build` flag** after code changes
5. **Use profiles** for optional services (ML)
6. **Check health** with curl commands
7. **Use volumes** for persistent data
8. **Clean up regularly** with `docker system prune`

---

Choose the deployment pattern that fits your needs! 🚀
