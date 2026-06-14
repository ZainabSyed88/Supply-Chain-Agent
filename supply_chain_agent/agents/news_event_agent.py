"""
News & Event Monitoring Agent
Scans for disruptions like strikes, weather, port issues
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class NewsEventMonitoringAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "News & Event Monitoring Agent"
    
    def monitor_disruptions(self, locations: List[str]) -> Dict:
        """
        Simulate news/event monitoring for disruptions
        In production, would integrate with NewsAPI, Twitter, etc.
        """
        
        # Mock disruption events
        mock_events = {
            "Shanghai, China": {"type": "Typhoon", "severity": "high", "eta": "48 hours"},
            "Rotterdam, Netherlands": {"type": "Port Strike", "severity": "high", "eta": "24 hours"},
            "Bangalore, India": {"type": "Heavy Traffic", "severity": "medium", "eta": "ongoing"},
            "Silicon Valley, USA": {"type": "Clear", "severity": "low", "eta": "N/A"}
        }
        
        detected_events = []
        for location in locations:
            event = mock_events.get(location, {"type": "No disruption", "severity": "low", "eta": "N/A"})
            detected_events.append({
                "location": location,
                "event": event['type'],
                "severity": event['severity'],
                "estimated_impact_hours": 48 if event['severity'] == 'high' else 24 if event['severity'] == 'medium' else 0
            })
        
        return {
            "agent": self.agent_name,
            "status": "success",
            "detected_events": detected_events,
            "total_events": len([e for e in detected_events if e['event'] != 'No disruption']),
            "critical_events": len([e for e in detected_events if e['severity'] == 'high'])
        }
    
    def execute(self, suppliers: List[Dict]) -> Dict:
        """Main execution"""
        locations = [s.get('location') for s in suppliers]
        events = self.monitor_disruptions(locations)
        
        summary = f"Monitoring {len(locations)} supplier locations - Found {events['critical_events']} critical events"
        
        return {
            "agent": self.agent_name,
            "detection_results": events,
            "summary": summary
        }
