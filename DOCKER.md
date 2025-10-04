# Docker Deployment Guide

This guide explains how to build and run Rayyan components using Docker.

## Docker Compose Options

Rayyan provides two ways to use Docker Compose:

1. **Root-level compose** (`docker-compose.yml` at project root) - Run all services together
2. **Individual compose files** - Each folder has its own `docker-compose.yml` for independent deployment

> 📘 **See [docs/docker-compose-individual.md](docs/docker-compose-individual.md) for detailed guide on running services independently**

## Quick Start

### All Services (Production)
```bash
# From project root
docker-compose up -d backend frontend edge
```

### Individual Service (Using folder-level compose)
```bash
# Backend only
cd backend && docker-compose up -d

# Frontend only
cd frontend && docker-compose up -d

# Edge only
cd edge && docker-compose up -d

# ML only
cd ml && docker-compose up -d
```

### Individual Services (Using Docker CLI)

#### Backend API
```bash
# Build
docker build -t rayyan-backend ./backend

# Run
docker run -d \
  --name rayyan-backend \
  -p 8000:8000 \
  --env-file backend/.env \
  rayyan-backend
```

#### Frontend Web App
```bash
# Build
docker build -t rayyan-frontend ./frontend

# Run
docker run -d \
  --name rayyan-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  rayyan-frontend
```

#### Edge Computing Module
```bash
# Build
docker build -t rayyan-edge ./edge

# Run
docker run -d \
  --name rayyan-edge \
  -p 5000:5000 \
  -v $(pwd)/edge/models:/app/models:ro \
  rayyan-edge
```

#### ML Training Environment
```bash
# Build
docker build -t rayyan-ml ./ml

# Run (with JupyterLab)
docker run -d \
  --name rayyan-ml \
  -p 8888:8888 \
  -v $(pwd)/ml:/workspace \
  -e JUPYTER_TOKEN=rayyan \
  rayyan-ml

# Access JupyterLab at: http://localhost:8888
# Token: rayyan (or set via JUPYTER_TOKEN)
```

## Docker Compose Profiles

### Production Stack (Backend + Frontend + Edge)
```bash
docker-compose up -d
```

### With ML Environment
```bash
docker-compose --profile ml up -d
```

### Stop All Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build backend
```

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o-mini
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Edge (.env)
```env
MQTT_BROKER=mqtt.example.com
MQTT_PORT=1883
BACKEND_API_URL=http://backend:8000
```

## Health Checks

All services include health checks:

```bash
# Check backend
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000/

# View service health
docker-compose ps
```

## Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Volume Management

### ML Models & Data
Models and datasets are mounted as volumes to avoid rebuilding images:

```yaml
volumes:
  - ./edge/models:/app/models:ro  # Read-only models
  - ./ml/datasets:/workspace/datasets  # Read-write for training
```

### Best Practices
- Keep models outside Docker images (use volumes)
- Mount large datasets as read-only when possible
- Use named volumes for persistent data

## Multi-Stage Builds

All Dockerfiles use multi-stage builds for optimization:

- **Backend**: Builder stage with uv → Runtime stage (Python 3.11-slim)
- **Frontend**: Dependencies → Builder → Runner (Node 20-alpine)
- **Edge**: Single stage optimized for lightweight inference
- **ML**: Development image with full ML stack + Jupyter

## Security

- All services run as non-root users
- Minimal base images (slim/alpine)
- Only necessary packages installed
- Health checks for automatic recovery
- Read-only mounts where applicable

## Production Considerations

1. **Use specific image tags**: `rayyan-backend:v1.0.0` instead of `latest`
2. **Set resource limits** in docker-compose:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```
3. **Enable logging driver**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```
4. **Use secrets** instead of environment variables for sensitive data
5. **Implement reverse proxy** (nginx/traefik) for HTTPS

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs rayyan-backend

# Check if port is already in use
lsof -i :8000

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Build issues
```bash
# Clean build without cache
docker-compose build --no-cache backend

# Prune unused images
docker system prune -a
```

### Network issues
```bash
# Recreate network
docker-compose down
docker network rm rayyan-network
docker-compose up -d
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend
        run: docker build -t rayyan-backend:${{ github.sha }} ./backend
      
      - name: Push to Registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push rayyan-backend:${{ github.sha }}
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Best Practices Guide](https://docs.docker.com/develop/dev-best-practices/)
