from __future__ import annotations

import asyncio
from datetime import datetime

from fastapi import APIRouter, Depends

from app.data_loader import get_data_service
from app.models.db_models import User
from app.services.auth_service import require_viewer
from app.services.news_service import get_news_service
from app.services.weather_service import get_weather_service

router = APIRouter()


@router.get("/news")
async def get_news_disruptions(current_user: User = Depends(require_viewer)):
    news_service = get_news_service()
    data_service = get_data_service()
    suppliers = [supplier.model_dump() for supplier in data_service.get_suppliers()]
    disruptions = await news_service.detect_disruptions_from_news(suppliers)
    articles = news_service.cached_articles
    return {
        "disruptions_detected": len(disruptions),
        "disruptions": disruptions,
        "raw_articles": [
            {
                "title": article.get("title"),
                "description": (article.get("description") or "")[:200],
                "source": article.get("source", {}).get("name"),
                "url": article.get("url"),
                "published_at": article.get("publishedAt"),
            }
            for article in articles[:10]
        ],
        "api_configured": bool(news_service.api_key),
        "fetched_at": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/weather")
async def get_weather_alerts(current_user: User = Depends(require_viewer)):
    weather_service = get_weather_service()
    data_service = get_data_service()
    suppliers = [supplier.model_dump() for supplier in data_service.get_suppliers()[:10]]
    weather_tasks = [
        weather_service.get_weather_for_location(supplier.get("country", ""), supplier.get("country", ""))
        for supplier in suppliers
    ]
    weather_results = await asyncio.gather(*weather_tasks, return_exceptions=True)
    supplier_weather = []
    for supplier, weather in zip(suppliers, weather_results):
        if isinstance(weather, Exception) or weather is None:
            continue
        supplier_weather.append({
            "supplier_id": supplier.get("supplier_id"),
            "supplier_name": supplier.get("name"),
            "country": supplier.get("country"),
            "weather": weather,
            "risk_flag": weather.get("is_severe", False),
        })

    alerts = await weather_service.check_weather_for_suppliers(suppliers)
    return {
        "supplier_weather": supplier_weather,
        "weather_alerts": alerts,
        "alert_count": len(alerts),
        "severe_count": sum(1 for item in supplier_weather if item.get("risk_flag")),
        "api_configured": bool(weather_service.api_key),
        "fetched_at": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/feed")
async def get_intelligence_feed(current_user: User = Depends(require_viewer)):
    news_service = get_news_service()
    weather_service = get_weather_service()
    data_service = get_data_service()
    suppliers = [supplier.model_dump() for supplier in data_service.get_suppliers()]

    news_disruptions, weather_alerts = await asyncio.gather(
        news_service.detect_disruptions_from_news(suppliers),
        weather_service.check_weather_for_suppliers(suppliers[:10]),
        return_exceptions=True,
    )
    if isinstance(news_disruptions, Exception):
        news_disruptions = []
    if isinstance(weather_alerts, Exception):
        weather_alerts = []

    feed: list[dict] = []
    for disruption in news_disruptions:
        feed.append({
            "id": disruption.get("disruption_id"),
            "type": "news",
            "severity": disruption.get("severity"),
            "title": disruption.get("title"),
            "description": (disruption.get("description") or "")[:150],
            "source": disruption.get("source_name", "News"),
            "source_url": disruption.get("source_url"),
            "affected_suppliers": disruption.get("affected_supplier_count", 0),
            "confidence": disruption.get("confidence"),
            "timestamp": disruption.get("published_at") or disruption.get("detected_at"),
            "icon": "news",
        })
    for alert in weather_alerts:
        feed.append({
            "id": alert.get("disruption_id"),
            "type": "weather",
            "severity": alert.get("severity"),
            "title": alert.get("title"),
            "description": (alert.get("description") or "")[:150],
            "source": "OpenWeatherMap",
            "source_url": None,
            "affected_suppliers": alert.get("affected_supplier_count", 0),
            "confidence": alert.get("confidence"),
            "timestamp": alert.get("detected_at"),
            "icon": "weather",
            "weather_icon_url": alert.get("weather_data", {}).get("icon_url"),
        })

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    feed.sort(key=lambda item: (severity_order.get(item.get("severity", "low"), 4), item.get("timestamp", "")))
    return {
        "feed": feed,
        "total": len(feed),
        "critical": sum(1 for item in feed if item.get("severity") == "critical"),
        "high": sum(1 for item in feed if item.get("severity") == "high"),
        "sources": {
            "news": len(news_disruptions),
            "weather": len(weather_alerts),
        },
        "last_updated": datetime.utcnow().isoformat() + "Z",
    }
