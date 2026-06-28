from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("weather_service")

WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"
SEVERE_WEATHER_CODES = {
    200: ("Thunderstorm with light rain", "medium"),
    201: ("Thunderstorm with rain", "high"),
    202: ("Thunderstorm with heavy rain", "high"),
    211: ("Thunderstorm", "high"),
    212: ("Heavy thunderstorm", "critical"),
    300: ("Light drizzle", "low"),
    501: ("Moderate rain", "low"),
    502: ("Heavy rain", "medium"),
    503: ("Very heavy rain", "high"),
    504: ("Extreme rain", "critical"),
    511: ("Freezing rain", "high"),
    601: ("Snow", "medium"),
    602: ("Heavy snow", "high"),
    711: ("Smoke", "medium"),
    741: ("Fog", "medium"),
    781: ("Tornado", "critical"),
    900: ("Tornado", "critical"),
    901: ("Tropical storm", "critical"),
    902: ("Hurricane", "critical"),
}


class WeatherService:
    def __init__(self) -> None:
        self.api_key = settings.weather_api_key
        self.weather_cache: dict[str, dict[str, Any]] = {}

    async def get_weather_for_location(self, location_name: str, country: str) -> dict[str, Any] | None:
        cache_key = f"{location_name},{country}"
        cached = self.weather_cache.get(cache_key)
        if cached and datetime.utcnow() - cached["fetched_at"] < timedelta(minutes=settings.weather_fetch_interval_minutes):
            return cached["data"]

        if not self.api_key:
            data = self._get_mock_weather(location_name, country)
            self.weather_cache[cache_key] = {"data": data, "fetched_at": datetime.utcnow()}
            return data

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(
                    f"{WEATHER_BASE_URL}/weather",
                    params={"q": f"{location_name},{country}", "appid": self.api_key, "units": "metric"},
                )
                if response.status_code == 404:
                    response = await client.get(
                        f"{WEATHER_BASE_URL}/weather",
                        params={"q": location_name, "appid": self.api_key, "units": "metric"},
                    )
                response.raise_for_status()
                data = self._parse_weather(response.json())
                self.weather_cache[cache_key] = {"data": data, "fetched_at": datetime.utcnow()}
                return data
        except Exception as exc:
            logger.warning("Weather fetch failed; using mock weather", location=location_name, error=str(exc))
            data = self._get_mock_weather(location_name, country)
            self.weather_cache[cache_key] = {"data": data, "fetched_at": datetime.utcnow()}
            return data

    def _parse_weather(self, payload: dict[str, Any]) -> dict[str, Any]:
        weather = (payload.get("weather") or [{}])[0]
        weather_id = weather.get("id", 800)
        severity_info = SEVERE_WEATHER_CODES.get(weather_id)
        severity = severity_info[1] if severity_info else "low"
        return {
            "city": payload.get("name"),
            "country": payload.get("sys", {}).get("country"),
            "lat": payload.get("coord", {}).get("lat"),
            "lon": payload.get("coord", {}).get("lon"),
            "weather_id": weather_id,
            "weather_main": weather.get("main", "Clear"),
            "weather_description": weather.get("description", "clear sky"),
            "temperature_c": payload.get("main", {}).get("temp"),
            "feels_like_c": payload.get("main", {}).get("feels_like"),
            "humidity": payload.get("main", {}).get("humidity"),
            "wind_speed_ms": payload.get("wind", {}).get("speed"),
            "visibility_m": payload.get("visibility"),
            "severity": severity,
            "is_severe": severity in {"medium", "high", "critical"},
            "icon": weather.get("icon"),
            "icon_url": f"https://openweathermap.org/img/wn/{weather.get('icon', '01d')}@2x.png",
            "fetched_at": datetime.utcnow().isoformat() + "Z",
        }

    async def check_weather_for_suppliers(self, suppliers: list[dict[str, Any]]) -> list[dict[str, Any]]:
        tasks = [self.get_weather_for_location(supplier.get("country", ""), supplier.get("country", "")) for supplier in suppliers]
        weather_results = await asyncio.gather(*tasks, return_exceptions=True)
        alerts: list[dict[str, Any]] = []
        for supplier, result in zip(suppliers, weather_results):
            if isinstance(result, Exception) or result is None or not result.get("is_severe"):
                continue
            alerts.append({
                "source": "weather",
                "disruption_id": f"WEATHER-{supplier['supplier_id']}",
                "type": "weather",
                "severity": result.get("severity", "low"),
                "title": f"Severe Weather at {supplier.get('name')}",
                "description": (
                    f"{result.get('weather_description', 'Weather event').title()} detected near {supplier.get('name')} "
                    f"in {supplier.get('country')}. Temperature {result.get('temperature_c', 'N/A')}°C."
                ),
                "affected_supplier_ids": [supplier["supplier_id"]],
                "affected_supplier_count": 1,
                "supplier_name": supplier.get("name"),
                "weather_data": result,
                "confidence": 0.92,
                "detected_at": datetime.utcnow().isoformat() + "Z",
                "active": True,
            })
        return alerts

    def _get_mock_weather(self, location_name: str, country: str) -> dict[str, Any]:
        risky_locations = {"Vietnam", "China", "Japan", "Netherlands"}
        is_severe = location_name in risky_locations or country in risky_locations
        severity = "high" if is_severe else "low"
        description = "heavy rain" if is_severe else "clear sky"
        icon = "10d" if is_severe else "01d"
        return {
            "city": location_name,
            "country": country,
            "lat": None,
            "lon": None,
            "weather_id": 503 if is_severe else 800,
            "weather_main": "Rain" if is_severe else "Clear",
            "weather_description": description,
            "temperature_c": 27 if is_severe else 22,
            "feels_like_c": 29 if is_severe else 22,
            "humidity": 83 if is_severe else 41,
            "wind_speed_ms": 9.6 if is_severe else 3.4,
            "visibility_m": 6000 if is_severe else 10000,
            "severity": severity,
            "is_severe": is_severe,
            "icon": icon,
            "icon_url": f"https://openweathermap.org/img/wn/{icon}@2x.png",
            "fetched_at": datetime.utcnow().isoformat() + "Z",
        }


_weather_service: WeatherService | None = None


def get_weather_service() -> WeatherService:
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service
