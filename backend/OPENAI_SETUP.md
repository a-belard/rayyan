# OpenAI API Configuration Guide

## Using Your Own OpenAI API Credits

The Rayyan backend is configured to use your OpenAI API key for the agricultural advisory agent.

## Setup Steps

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys**: https://platform.openai.com/api-keys
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

### 2. Configure Backend Environment

#### Option A: Using `.env` file (Recommended)

```bash
cd backend

# Copy example file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add your OpenAI API key:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_API_BASE=https://api.openai.com/v1

# Model Configuration
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o-mini  # or gpt-4o, gpt-3.5-turbo
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
```

#### Option B: Using Environment Variables

```bash
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
export OPENAI_API_BASE="https://api.openai.com/v1"
export DEFAULT_LLM_MODEL="gpt-4o-mini"
```

### 3. Choose Your Model

Available OpenAI models:

| Model | Cost | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `gpt-4o-mini` | Lowest | Fast | Good | General use, development |
| `gpt-4o` | Medium | Medium | Excellent | Production, complex queries |
| `gpt-3.5-turbo` | Low | Fastest | Good | Simple queries, high volume |

**Recommendation**: Start with `gpt-4o-mini` for development, switch to `gpt-4o` for production.

### 4. Verify Configuration

```bash
cd backend

# Check configuration
python -c "from config import settings; print(f'API Key: {settings.openai_api_key[:10]}...'); print(f'Model: {settings.default_llm_model}')"
```

Expected output:
```
API Key: sk-proj-...
Model: gpt-4o-mini
```

### 5. Test the Agent

Start the backend:
```bash
python main.py
```

Test with curl:
```bash
# Create a thread
curl -X POST http://localhost:8000/api/v1/threads \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Irrigation Query"
  }'

# Send a message (replace THREAD_ID)
curl -X POST http://localhost:8000/api/v1/agent/threads/THREAD_ID/run \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the optimal irrigation schedule for tomatoes?"
  }'
```

## Custom OpenAI-Compatible Endpoints

If you're using an OpenAI-compatible API (like Azure OpenAI, local models, or proxies):

### Azure OpenAI

```bash
OPENAI_API_KEY=your-azure-api-key
OPENAI_API_BASE=https://your-resource.openai.azure.com/openai/deployments/your-deployment
DEFAULT_LLM_MODEL=gpt-4
```

### Local LLM (e.g., LM Studio, text-generation-webui)

```bash
OPENAI_API_KEY=not-needed  # Some local APIs don't require this
OPENAI_API_BASE=http://localhost:1234/v1
DEFAULT_LLM_MODEL=local-model
```

### OpenAI Proxy

```bash
OPENAI_API_KEY=sk-your-key
OPENAI_API_BASE=https://your-proxy.com/v1
DEFAULT_LLM_MODEL=gpt-4o-mini
```

## Cost Management

### Estimate Costs

Approximate costs per 1000 tokens (as of 2024):

| Model | Input | Output |
|-------|-------|--------|
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4o | $2.50 | $10.00 |
| gpt-3.5-turbo | $0.50 | $1.50 |

**Typical conversation:**
- Average message: ~500 tokens
- Agent response: ~800 tokens
- Cost per interaction (gpt-4o-mini): ~$0.001

### Set Usage Limits

1. Go to [OpenAI Usage Limits](https://platform.openai.com/account/limits)
2. Set monthly budget cap
3. Enable email notifications

### Monitor Usage

```bash
# Check usage via API
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

Or view in dashboard: https://platform.openai.com/usage

## Troubleshooting

### Error: "OpenAI API key not configured"

**Solution**: Check that `OPENAI_API_KEY` is set in `.env` file.

```bash
# Verify
grep OPENAI_API_KEY backend/.env
```

### Error: "Incorrect API key provided"

**Solution**: 
1. Verify key is correct (starts with `sk-`)
2. Check no extra spaces or quotes
3. Generate new key if needed

### Error: "Rate limit exceeded"

**Solution**:
1. Check [Rate Limits](https://platform.openai.com/account/rate-limits)
2. Implement backoff/retry logic
3. Upgrade API tier if needed

### Error: "Model not found"

**Solution**: Check available models:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Slow Responses

**Solutions**:
1. Use `gpt-3.5-turbo` or `gpt-4o-mini` for faster responses
2. Reduce `LLM_MAX_TOKENS` setting
3. Check network/API latency

## Best Practices

### 1. Secure Your API Key
- ✅ Never commit `.env` to Git
- ✅ Use environment variables in production
- ✅ Rotate keys periodically
- ✅ Use separate keys for dev/prod

### 2. Optimize Costs
- ✅ Use `gpt-4o-mini` for development
- ✅ Limit `CHAT_HISTORY_MAX_MESSAGES` to reduce context
- ✅ Cache common responses
- ✅ Monitor usage regularly

### 3. Handle Errors
- ✅ Implement retry logic with exponential backoff
- ✅ Handle rate limits gracefully
- ✅ Log errors for debugging
- ✅ Provide fallback responses

### 4. Performance
- ✅ Enable streaming for better UX
- ✅ Use appropriate max_tokens setting
- ✅ Choose right model for task
- ✅ Monitor response times

## Docker Configuration

When using Docker, pass API key as environment variable:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DEFAULT_LLM_MODEL=gpt-4o-mini
```

Or in `.env` file:
```bash
# .env (in same directory as docker-compose.yml)
OPENAI_API_KEY=sk-your-key-here
```

## Multiple Providers

To use both OpenAI and Anthropic:

```bash
# In .env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
DEFAULT_LLM_PROVIDER=openai  # Change to "anthropic" to switch
```

Switch dynamically via API:
```python
# In your code
from agent.llm_config import get_llm

# Use OpenAI
llm = get_llm(provider="openai", model="gpt-4o-mini")

# Use Anthropic
llm = get_llm(provider="anthropic", model="claude-3-5-sonnet-20241022")
```

## Support

- **OpenAI Documentation**: https://platform.openai.com/docs
- **API Status**: https://status.openai.com/
- **Community Forum**: https://community.openai.com/
- **Support**: https://help.openai.com/

---

Your OpenAI API integration is now configured! 🚀
