import json
import os
from pathlib import Path
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


CONFIG_FILE = Path(__file__).resolve()
BACKEND_ENV_FILE = CONFIG_FILE.parents[2] / ".env"
PROJECT_ENV_FILE = CONFIG_FILE.parents[3] / ".env"


def _running_on_railway() -> bool:
    return bool(os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RAILWAY_PROJECT_ID"))


def _default_database_url() -> str:
    return "sqlite:////tmp/chainpulse.db" if _running_on_railway() else "sqlite:///./chainpulse.db"


def _default_log_file() -> str:
    return "/tmp/logs/app.log" if _running_on_railway() else "logs/app.log"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_ENV_FILE), str(PROJECT_ENV_FILE)),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Supply Chain Disruption Agent"
    environment: str = "development"
    api_prefix: str = "/api"
    database_url: str = _default_database_url()
    # Required in every deployed environment. Leave blank locally until configured in .env.
    secret_key: str = ""
    access_token_expire_minutes: int = 60 * 24
    refresh_token_expire_days: int = 30
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    openai_api_key: str = ""
    openai_model: str = "gpt-4"
    news_api_key: str = ""
    weather_api_key: str = ""
    news_fetch_interval_minutes: int = 30
    weather_fetch_interval_minutes: int = 60
    frontend_url: str = "http://localhost:8000"
    # Used only to bootstrap the first admin on an empty database.
    admin_bootstrap_username: str = ""
    admin_bootstrap_email: str = ""
    admin_bootstrap_password: str = ""
    admin_bootstrap_full_name: str = "ChainPulse Admin"
    run_timeout_seconds: int = 30
    log_level: str = "INFO"
    log_file: str = _default_log_file()
    log_rotation_size: str = "10 MB"
    log_backup_count: int = 5
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    cache_ttl_seconds: int = 60

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> Any:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                return json.loads(stripped)
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value


settings = Settings()
