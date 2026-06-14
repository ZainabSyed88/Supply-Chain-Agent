"""
Demand Forecasting Agent
Analyzes historical data and predicts future demand
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class DemandForecastingAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Demand Forecasting Agent"
    
    def forecast_demand(self) -> Dict:
        """Simulate demand forecasting using historical data"""
        
        # Mock demand forecast
        forecast = {
            "Product X": {"current_demand": 1000, "forecast_1week": 1250, "growth": "25%"},
            "Product Y": {"current_demand": 800, "forecast_1week": 750, "growth": "-6%"},
            "Product Z": {"current_demand": 500, "forecast_1week": 650, "growth": "30%"}
        }
        
        high_growth = [p for p, d in forecast.items() if float(d['growth'].strip('%')) > 20]
        
        return {
            "agent": self.agent_name,
            "status": "success",
            "forecast_period": "Next 7 days",
            "demand_forecast": forecast,
            "high_growth_products": high_growth,
            "average_growth": "16%"
        }
    
    def detect_demand_spikes(self) -> Dict:
        """Identify unusual demand patterns"""
        
        spike_alerts = [
            {"product": "Product X", "spike_percentage": 25, "reason": "Seasonal demand increase", "confidence": "92%"},
            {"product": "Product Z", "spike_percentage": 30, "reason": "Marketing campaign impact", "confidence": "88%"}
        ]
        
        return {
            "agent": self.agent_name,
            "spike_alerts": spike_alerts,
            "urgent_products": [s['product'] for s in spike_alerts if s['spike_percentage'] > 25]
        }
    
    def execute(self) -> Dict:
        """Main execution"""
        forecast = self.forecast_demand()
        spikes = self.detect_demand_spikes()
        
        return {
            "agent": self.agent_name,
            "demand_forecast": forecast,
            "spike_detection": spikes,
            "summary": f"Forecasted demand increase for {len(forecast['high_growth_products'])} products"
        }
