"""
Risk Assessment Agent
Evaluates impact and prioritizes interventions
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class RiskAssessmentAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Risk Assessment Agent"
    
    def load_shipments(self, filepath: str) -> List[Dict]:
        """Load shipment data from JSON file"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                return data.get('shipments', [])
        except FileNotFoundError:
            logger.error(f"Shipments file not found: {filepath}")
            return []
    
    def assess_impact(self, disruptions: List[Dict], shipments: List[Dict]) -> Dict:
        """
        Assess business impact of disruptions on shipments
        """
        
        disruption_summary = json.dumps(disruptions, indent=2)
        shipment_summary = json.dumps(shipments, indent=2)
        
        system_prompt = """You are a Risk Assessment Analyst.
        Evaluate how disruptions impact shipments considering:
        1. Shipment value and priority
        2. Delivery timeline impact
        3. Business criticality
        4. Financial risk
        
        Score each at-risk shipment: 0-10 (10 = highest impact)
        Provide prioritization for intervention."""
        
        user_message = f"""Assess impact of these disruptions on shipments:
        
        DISRUPTIONS:
        {disruption_summary}
        
        SHIPMENTS:
        {shipment_summary}
        
        Evaluate impact and prioritize critical shipments."""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.3,
                max_tokens=700
            )
            
            return {
                "status": "success",
                "agent": self.agent_name,
                "impact_assessment": response.choices[0].message.content,
                "shipments_evaluated": len(shipments)
            }
        except Exception as e:
            logger.error(f"Error in risk assessment: {str(e)}")
            return {
                "status": "error",
                "agent": self.agent_name,
                "error": str(e)
            }
    
    def prioritize_interventions(self, disruptions: List[Dict], shipments: List[Dict]) -> Dict:
        """Generate priority list for interventions"""
        
        # Calculate risk scores
        at_risk_shipments = []
        
        for shipment in shipments:
            supplier_id = shipment.get('supplier_id')
            affected_by_disruption = any(
                supplier_id in d.get('affected_suppliers', []) 
                for d in disruptions
            )
            
            if affected_by_disruption:
                risk_score = (
                    (shipment.get('value', 0) / 100000) * 0.4 +  # Value weight
                    (1 if shipment.get('priority') == 'critical' else 0.5) * 0.3 +  # Priority weight
                    0.3  # Base disruption impact
                )
                
                at_risk_shipments.append({
                    "shipment_id": shipment.get('id'),
                    "risk_score": min(risk_score, 1.0),
                    "priority": shipment.get('priority'),
                    "value": shipment.get('value')
                })
        
        # Sort by risk score
        at_risk_shipments.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return {
            "status": "success",
            "agent": self.agent_name,
            "at_risk_shipments": at_risk_shipments[:10],  # Top 10
            "total_at_risk": len(at_risk_shipments),
            "timestamp": "2026-06-14T14:00:00Z"
        }
    
    def execute(self, disruptions: List[Dict], shipments_source: str) -> Dict:
        """Main execution method"""
        shipments = self.load_shipments(shipments_source)
        impact = self.assess_impact(disruptions, shipments)
        priorities = self.prioritize_interventions(disruptions, shipments)
        
        return {
            "agent": self.agent_name,
            "impact_assessment": impact,
            "intervention_priorities": priorities
        }
