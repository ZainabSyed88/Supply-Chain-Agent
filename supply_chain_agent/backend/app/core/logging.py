import sys
from pathlib import Path
from loguru import logger
from .config import settings


def configure_logging() -> None:
    Path(settings.log_file).parent.mkdir(parents=True, exist_ok=True)
    logger.remove()
    logger.add(
        sys.stdout,
        format="{time:YYYY-MM-DDTHH:mm:ss.SSSZ} | {level} | {message}",
        level=settings.log_level,
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )
    logger.add(
        settings.log_file,
        rotation=settings.log_rotation_size,
        retention=settings.log_backup_count,
        level=settings.log_level,
        enqueue=True,
        backtrace=True,
        diagnose=True,
        serialize=True,
    )


def get_logger(name: str):
    return logger.bind(service=name)
