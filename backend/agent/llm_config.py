"""
LLM configuration and initialization for the agricultural agent.
"""

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from config import settings


def get_llm(provider: str | None = None, model: str | None = None, temperature: float | None = None):
    """
    Get the configured LLM for the agent.
    
    Args:
        provider: LLM provider ("openai" or "anthropic"), defaults to settings
        model: Model name, defaults to settings
        temperature: Temperature for generation, defaults to settings
    
    Returns:
        Configured LLM instance
    """
    provider = provider or settings.default_llm_provider
    model = model or settings.default_llm_model
    temperature = temperature if temperature is not None else settings.llm_temperature
    
    if provider == "openai":
        if not settings.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        return ChatOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,  # Support custom endpoints
            model=model,
            temperature=temperature,
            max_tokens=settings.llm_max_tokens,
            streaming=True,
        )
    elif provider == "anthropic":
        if not settings.anthropic_api_key:
            raise ValueError("Anthropic API key not configured")
        return ChatAnthropic(
            api_key=settings.anthropic_api_key,
            model=model,
            temperature=temperature,
            max_tokens=settings.llm_max_tokens,
            streaming=True,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


__all__ = ["get_llm"]
