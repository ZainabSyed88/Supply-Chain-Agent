try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Supply Chain Disruption Agent"
    environment: str = "development"
    api_prefix: str = "/api"
    run_timeout_seconds: int = 30
    log_file: str = "logs/app.log"
    log_rotation_size: str = "10 MB"
    log_backup_count: int = 5
    cors_origins: list[str] = ["*"]
    cache_ttl_seconds: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
