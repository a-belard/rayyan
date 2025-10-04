# Individual Docker Compose Guide

This guide explains how to run each Rayyan component independently using its own docker-compose.yml file.

## Overview

Each main folder now has its own `docker-compose.yml` for independent deployment:

```
rayyan/
├── backend/docker-compose.yml     # Backend API server
├── frontend/docker-compose.yml    # Next.js web application  
├── edge/docker-compose.yml        # Edge computing module
└── ml/docker-compose.yml          # ML training environment
```

---

## Backend

### Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase and API keys
```

### Run
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Access
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### Environment Variables
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o-mini
```

---

## Frontend

### Setup
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with API URL
```

### Run
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Access
- Web App: http://localhost:3000

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Connect to Backend Network (Optional)
If running backend separately, connect to its network:

```yaml
# In frontend/docker-compose.yml
networks:
  frontend-network:
    external: true
    name: rayyan-backend-network
```

---

## Edge

### Setup
```bash
cd edge
cp .env.example .env
# Edit .env with MQTT and backend configuration
```

### Run
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Access
- Edge API: http://localhost:5000 (if enabled)

### Environment Variables
```env
MQTT_BROKER=mqtt.eclipseprojects.io
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
BACKEND_API_URL=http://localhost:8000
DEVICE_ID=edge-001
INFERENCE_MODE=onnx
```

### Model Files
Place your ONNX/TFLite models in the `models/` directory:
```bash
edge/
├── models/
│   ├── pest_detection.onnx
│   ├── soil_classifier.tflite
│   └── ...
```

### Hardware Access (Raspberry Pi, etc.)
Uncomment device mappings in docker-compose.yml:
```yaml
devices:
  - /dev/gpiomem:/dev/gpiomem
  - /dev/i2c-1:/dev/i2c-1
```

---

## ML

### Setup
```bash
cd ml
cp .env.example .env
# Edit .env with Jupyter token and configuration
```

### Run
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Access
- Jupyter Lab: http://localhost:8888
- Token: `rayyan` (or set in .env)
- TensorBoard: http://localhost:6006 (if enabled)

### Environment Variables
```env
JUPYTER_TOKEN=rayyan
CUDA_VISIBLE_DEVICES=0  # For GPU support
TF_CPP_MIN_LOG_LEVEL=2
```

### GPU Support
Uncomment GPU configuration in docker-compose.yml:
```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

**Requirements:**
- NVIDIA Docker runtime installed
- NVIDIA drivers installed on host

### Working with Notebooks
All notebooks and data are mounted as volumes:
```bash
ml/
├── notebooks/         # Jupyter notebooks
├── datasets/          # Training data
├── models/            # Trained models
└── scripts/           # Training scripts
```

Changes are persisted automatically.

---

## Multi-Service Deployment

### Run Backend + Frontend Together
```bash
# Terminal 1: Start backend
cd backend && docker-compose up -d

# Terminal 2: Start frontend (with network connection)
cd frontend && docker-compose up -d
```

### Run Complete Stack
Use the root docker-compose.yml:
```bash
# From project root
docker-compose up -d
```

---

## Common Commands

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### Check Status
```bash
docker-compose ps
```

### Execute Commands Inside Container
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# ML
docker-compose exec ml bash
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## Development vs Production

### Development Mode

**Backend:**
```yaml
# Uncomment in docker-compose.yml
volumes:
  - ./:/app  # Live code reload
```

**Frontend:**
```yaml
# Uncomment in docker-compose.yml
volumes:
  - ./src:/app/src
  - ./public:/app/public
```

**ML:**
Already configured with volume mounts for development.

### Production Mode

Use default configuration (no code mounts). Build optimized images:
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Resource Limits

Add resource limits for production:

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Networking

### Default Networks
Each service creates its own bridge network:
- `rayyan-backend-network`
- `rayyan-frontend-network`
- `rayyan-edge-network`
- `rayyan-ml-network`

### Connect Services
To connect frontend to backend network:

```yaml
# In frontend/docker-compose.yml
networks:
  default:
    external: true
    name: rayyan-backend-network
```

Or use the root docker-compose.yml for automatic networking.

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :8000

# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Host:Container
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose up -d --build

# Start without detached mode to see errors
docker-compose up
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run as root (not recommended)
docker-compose exec -u root backend bash
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Deploy
        run: |
          cd backend
          docker-compose build
          docker-compose up -d
```

---

## Best Practices

1. **Always use .env files** - Never commit secrets
2. **Use specific image tags** - `rayyan-backend:v1.0.0` not `latest`
3. **Enable health checks** - Already configured in all services
4. **Set resource limits** - Prevent one service from consuming all resources
5. **Use volumes for data** - Persist important data outside containers
6. **Regular backups** - Back up database and model files
7. **Monitor logs** - Use `docker-compose logs -f` regularly
8. **Update regularly** - Keep base images and dependencies up to date

---

## Additional Resources

- [DOCKER.md](../DOCKER.md) - Root-level Docker guide
- [DOCKER_SETUP.md](../DOCKER_SETUP.md) - Setup summary
- [README.md](../README.md) - Project overview

---

Each service is now fully independent and can be developed, tested, and deployed separately! 🚀
