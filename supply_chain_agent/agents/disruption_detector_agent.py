"""
Disruption Detection Agent
Identifies supply chain risks and disruptions
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class DisruptionDetectorAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Disruption Detection Agent"
    
    def load_disruptions(self, filepath: str) -> List[Dict]:
        """Load disruption data from JSON file"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                return data.get('active_disruptions', [])
        except FileNotFoundError:
            logger.error(f"Disruptions file not found: {filepath}")
            return []
    
    def detect_disruptions(self, disruptions: List[Dict], suppliers: List[Dict]) -> Dict:
        """
        Analyze disruptions and their impact on suppliers
        """
        
        disruption_summary = json.dumps(disruptions, indent=2)
        supplier_summary = json.dumps(suppliers, indent=2)
        
        system_prompt = """You are a Supply Chain Risk Detection Agent.
        Analyze disruption data and supplier locations to:
        1. Identify which suppliers are affected
        2. Estimate impact severity (1-10 scale)
        3. Flag critical disruptions
        4. Recommend monitoring priority
        
        Be concise and actionable."""
        
        user_message = f"""Analyze these disruptions and supplier data:
        
        DISRUPTIONS:
        {disruption_summary}
        
        SUPPLIERS:
        {supplier_summary}
        
        Identify affected suppliers and impact levels."""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.4,
                max_tokens=600
            )
            
            return {
                "status": "success",
                "agent": self.agent_name,
                "disruption_analysis": response.choices[0].message.content,
                "disruption_count": len(disruptions),
                "disruption_types": list(set(d.get('type', 'unknown') for d in disruptions))
            }
        except Exception as e:
            logger.error(f"Error in disruption detection: {str(e)}")
            return {
                "status": "error",
                "agent": self.agent_name,
                "error": str(e)
            }
    
    def assess_risk_levels(self, disruptions: List[Dict]) -> Dict:
        """Categorize disruptions by severity"""
        
        risk_levels = {
            "critical": sum(1 for d in disruptions if d.get('severity') == 'high'),
            "medium": sum(1 for d in disruptions if d.get('severity') == 'medium'),
            "low": sum(1 for d in disruptions if d.get('severity') == 'low')
        }
        
        total_delay_hours = sum(d.get('estimated_delay_hours', 0) for d in disruptions)
        
        return {
            "status": "success",
            "agent": self.agent_name,
            "risk_levels": risk_levels,
            "total_estimated_delay_hours": total_delay_hours,
            "timestamp": "2026-06-14T14:00:00Z"
        }
    
    def execute(self, disruptions_source: str, suppliers_source: str, suppliers: List[Dict]) -> Dict:
        """Main execution method"""
        disruptions = self.load_disruptions(disruptions_source)
        analysis = self.detect_disruptions(disruptions, suppliers)
        risk_assessment = self.assess_risk_levels(disruptions)
        
        return {
            "agent": self.agent_name,
            "disruption_analysis": analysis,
            "risk_assessment": risk_assessment
        }
