from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("news_service")

NEWS_BASE_URL = "https://newsapi.org/v2"
DISRUPTION_KEYWORDS = [
    "port strike",
    "supply chain disruption",
    "factory shutdown",
    "shipping delay",
    "logistics crisis",
    "trade disruption",
    "port congestion",
    "freight shortage",
    "cargo delay",
    "manufacturing halt",
    "supplier bankruptcy",
    "sanctions",
    "export ban",
    "import restriction",
    "customs delay",
    "warehouse fire",
    "flood supply chain",
    "earthquake factory",
    "typhoon port",
    "hurricane shipping",
    "drought manufacturing",
]
TYPE_KEYWORDS = {
    "strike": ["strike", "walkout", "protest", "labor dispute", "union"],
    "weather": ["typhoon", "hurricane", "flood", "earthquake", "tsunami", "storm", "drought", "wildfire"],
    "port_congestion": ["port congestion", "port delay", "shipping backlog", "vessel queue", "harbor backup"],
    "geopolitical": ["sanctions", "trade war", "export ban", "tariff", "embargo", "conflict", "war disruption"],
    "customs": ["customs delay", "border closure", "import restriction", "regulatory hold", "inspection backlog"],
}
SEVERITY_KEYWORDS = {
    "critical": ["shutdown", "closure", "ban", "halt", "catastrophic", "emergency", "crisis", "collapse"],
    "high": ["major", "significant", "severe", "serious", "widespread"],
    "medium": ["disruption", "delay", "shortage", "slowdown", "impact"],
    "low": ["minor", "slight", "limited", "temporary", "small"],
}
SUPPLY_CHAIN_REGIONS = [
    "China", "Japan", "South Korea", "Vietnam", "India", "Bangladesh", "Germany", "Netherlands", "Rotterdam",
    "Shanghai", "Shenzhen", "Singapore", "Hong Kong", "Los Angeles", "Long Beach", "Suez", "Panama Canal",
    "Taiwan", "Malaysia", "Thailand", "Indonesia", "Mexico", "United States", "Poland",
]


class NewsService:
    def __init__(self) -> None:
        self.api_key = settings.news_api_key
        self.cached_articles: list[dict[str, Any]] = []
        self.last_fetch: datetime | None = None

    async def fetch_supply_chain_news(self, hours_back: int = 24) -> list[dict[str, Any]]:
        if not self.api_key:
            logger.warning("NEWS_API_KEY not configured; using mock news")
            self.cached_articles = self._get_mock_news()
            return self.cached_articles

        if self.last_fetch and datetime.utcnow() - self.last_fetch < timedelta(minutes=settings.news_fetch_interval_minutes):
            return self.cached_articles

        query = " OR ".join(f'"{keyword}"' for keyword in DISRUPTION_KEYWORDS[:10])
        from_date = (datetime.utcnow() - timedelta(hours=hours_back)).strftime("%Y-%m-%dT%H:%M:%SZ")

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{NEWS_BASE_URL}/everything",
                    params={
                        "q": query,
                        "from": from_date,
                        "language": "en",
                        "sortBy": "publishedAt",
                        "pageSize": 20,
                        "apiKey": self.api_key,
                    },
                )
                response.raise_for_status()
                payload = response.json()
                self.cached_articles = payload.get("articles", [])
                self.last_fetch = datetime.utcnow()
                return self.cached_articles
        except Exception as exc:
            logger.warning("News fetch failed; using cache or mock", error=str(exc))
            return self.cached_articles or self._get_mock_news()

    def classify_article(self, article: dict[str, Any]) -> dict[str, Any] | None:
        title = (article.get("title") or "").lower()
        description = (article.get("description") or "").lower()
        content = f"{title} {description}"
        if not any(keyword.lower() in content for keyword in DISRUPTION_KEYWORDS):
            return None

        disruption_type = "geopolitical"
        for type_name, keywords in TYPE_KEYWORDS.items():
            if any(keyword in content for keyword in keywords):
                disruption_type = type_name
                break

        severity = "medium"
        for severity_name, keywords in SEVERITY_KEYWORDS.items():
            if any(keyword in content for keyword in keywords):
                severity = severity_name
                break

        affected_region = next((region for region in SUPPLY_CHAIN_REGIONS if region.lower() in content), None)
        keyword_matches = sum(1 for keyword in DISRUPTION_KEYWORDS if keyword.lower() in content)
        confidence = min(0.95, 0.5 + keyword_matches * 0.08)

        return {
            "source": "news",
            "disruption_id": f"NEWS-{abs(hash(article.get('url', title))) % 100000:05d}",
            "type": disruption_type,
            "severity": severity,
            "title": article.get("title") or "Supply Chain Disruption Detected",
            "description": (article.get("description") or "")[:300],
            "affected_region": affected_region,
            "source_url": article.get("url"),
            "source_name": article.get("source", {}).get("name", "News"),
            "published_at": article.get("publishedAt"),
            "confidence": round(confidence, 2),
            "detected_at": datetime.utcnow().isoformat() + "Z",
            "active": True,
        }

    async def detect_disruptions_from_news(self, suppliers: list[dict[str, Any]]) -> list[dict[str, Any]]:
        articles = await self.fetch_supply_chain_news()
        disruptions: list[dict[str, Any]] = []
        for article in articles:
            disruption = self.classify_article(article)
            if disruption is None:
                continue

            region = (disruption.get("affected_region") or "").lower()
            affected_supplier_ids = [
                supplier["supplier_id"]
                for supplier in suppliers
                if region and region in supplier.get("country", "").lower()
            ]
            disruption["affected_supplier_ids"] = affected_supplier_ids
            disruption["affected_supplier_count"] = len(affected_supplier_ids)
            disruptions.append(disruption)

        return disruptions

    def _get_mock_news(self) -> list[dict[str, Any]]:
        now = datetime.utcnow().isoformat() + "Z"
        return [
            {
                "title": "Major port strike threatens supply chain in Rotterdam",
                "description": "Dock workers in Rotterdam have begun a major strike affecting vessels and delaying freight across Europe.",
                "url": "https://example.com/news/rotterdam-port-strike",
                "source": {"name": "Supply Chain Dive"},
                "publishedAt": now,
            },
            {
                "title": "Typhoon disrupts manufacturing in Vietnam",
                "description": "Severe weather has forced temporary factory shutdowns across Vietnam, impacting electronics and textile output.",
                "url": "https://example.com/news/vietnam-typhoon",
                "source": {"name": "Reuters"},
                "publishedAt": now,
            },
            {
                "title": "Suez Canal congestion causes shipping backlog",
                "description": "Heavy vessel traffic is causing shipping delays of up to 72 hours for global cargo lanes.",
                "url": "https://example.com/news/suez-congestion",
                "source": {"name": "Bloomberg"},
                "publishedAt": now,
            },
        ]


_news_service: NewsService | None = None


def get_news_service() -> NewsService:
    global _news_service
    if _news_service is None:
        _news_service = NewsService()
    return _news_service
