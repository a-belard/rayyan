"""
Configuration module for backend settings.
Uses Pydantic Settings for environment variable management.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Application
    app_name: str = "Rayyan Backend API"
    debug: bool = False
    
    # Supabase Configuration
    supabase_url: str
    supabase_key: str  # Anon/public key for client operations
    supabase_service_key: str | None = None  # Service role key for admin operations
    
    # Database Configuration (Direct PostgreSQL connection)
    database_url: str  # PostgreSQL connection string from Supabase
    
    # API Configuration
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # AI/LLM Configuration
    openai_api_key: str | None = None
    openai_api_base: str = "https://api.openai.com/v1"  # Custom endpoint support
    anthropic_api_key: str | None = None
    default_llm_provider: str = "openai"  # or "anthropic"
    default_llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 2000
    
    # Agent Configuration
    chat_history_max_messages: int = 20
    agent_max_iterations: int = 10
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Global settings instance
settings = Settings()
