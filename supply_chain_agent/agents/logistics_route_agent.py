"""
Logistics Route Optimization Agent
Monitors shipment routes and suggests optimizations
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class LogisticsRouteAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Logistics Route Agent"
    
    def monitor_shipment_routes(self, shipments: List[Dict]) -> Dict:
        """Monitor active shipment routes"""
        
        route_status = []
        for shipment in shipments:
            status = "on_track" if shipment.get('priority') != 'critical' else "delayed"
            delay_hours = 18 if status == "delayed" else 0
            
            route_status.append({
                "shipment_id": shipment.get('id'),
                "origin": shipment.get('origin'),
                "destination": shipment.get('destination'),
                "status": status,
                "current_delay_hours": delay_hours,
                "expected_delivery": shipment.get('expected_delivery')
            })
        
        delayed_shipments = [r for r in route_status if r['status'] == 'delayed']
        
        return {
            "agent": self.agent_name,
            "total_shipments": len(route_status),
            "delayed_shipments": len(delayed_shipments),
            "route_status": route_status,
            "average_delay_hours": sum(r['current_delay_hours'] for r in delayed_shipments) / len(delayed_shipments) if delayed_shipments else 0
        }
    
    def suggest_alternate_routes(self, delayed_shipments: List[Dict]) -> Dict:
        """Suggest alternate routes to recover delays"""
        
        alternate_routes = [
            {
                "shipment_id": "SHIP001",
                "current_route": "Suez Canal",
                "alternate_route": "Air Freight Express",
                "current_delay": 18,
                "alternate_delay": 5,
                "delay_reduction": 13,
                "cost_increase": "3.5x",
                "recommendation": "Use air freight for critical shipment"
            },
            {
                "shipment_id": "SHIP002",
                "current_route": "Rotterdam Port",
                "alternate_route": "Hamburg Port (avoid strike)",
                "current_delay": 24,
                "alternate_delay": 8,
                "delay_reduction": 16,
                "cost_increase": "1.2x",
                "recommendation": "Reroute through Hamburg"
            }
        ]
        
        return {
            "agent": self.agent_name,
            "alternate_routes": alternate_routes,
            "routes_with_significant_improvement": len([r for r in alternate_routes if r['delay_reduction'] > 12])
        }
    
    def execute(self, shipments: List[Dict]) -> Dict:
        """Main execution"""
        routes = self.monitor_shipment_routes(shipments)
        alternates = self.suggest_alternate_routes([r for r in routes['route_status'] if r['status'] == 'delayed'])
        
        return {
            "agent": self.agent_name,
            "route_monitoring": routes,
            "alternate_routes": alternates,
            "summary": f"Monitoring {routes['total_shipments']} routes - {routes['delayed_shipments']} delayed - {alternates['routes_with_significant_improvement']} viable alternatives"
        }
