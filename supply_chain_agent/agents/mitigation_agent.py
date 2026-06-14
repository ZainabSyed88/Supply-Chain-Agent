"""
Mitigation Agent
Recommends alternative suppliers and routes
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class MitigationAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Mitigation Agent"
    
    def load_suppliers(self, filepath: str) -> List[Dict]:
        """Load supplier data"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                return data.get('suppliers', [])
        except FileNotFoundError:
            logger.error(f"Suppliers file not found: {filepath}")
            return []
    
    def recommend_alternatives(self, at_risk_shipments: List[Dict], suppliers: List[Dict], disruptions: List[Dict]) -> Dict:
        """
        Recommend alternative suppliers and routes
        """
        
        supplier_summary = json.dumps(suppliers, indent=2)
        shipment_summary = json.dumps(at_risk_shipments, indent=2)
        disruption_summary = json.dumps(disruptions, indent=2)
        
        system_prompt = """You are a Supply Chain Mitigation Specialist.
        For disrupted shipments, recommend:
        1. Alternative suppliers with better on_time_rate
        2. Alternative shipping routes
        3. Cost/time trade-offs
        4. Implementation timeline
        
        Consider: supplier capacity, location, risk score, on-time rates."""
        
        user_message = f"""Recommend mitigation strategies:
        
        AT-RISK SHIPMENTS:
        {shipment_summary}
        
        ALTERNATIVE SUPPLIERS:
        {supplier_summary}
        
        ACTIVE DISRUPTIONS:
        {disruption_summary}
        
        Provide specific recommendations for each at-risk shipment."""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.5,
                max_tokens=800
            )
            
            return {
                "status": "success",
                "agent": self.agent_name,
                "recommendations": response.choices[0].message.content
            }
        except Exception as e:
            logger.error(f"Error in mitigation recommendations: {str(e)}")
            return {
                "status": "error",
                "agent": self.agent_name,
                "error": str(e)
            }
    
    def calculate_mitigation_costs(self, at_risk_shipments: List[Dict]) -> Dict:
        """Calculate costs of mitigation options"""
        
        total_at_risk_value = sum(s.get('value', 0) for s in at_risk_shipments)
        
        # Estimate mitigation costs (simplified)
        expedited_cost = total_at_risk_value * 0.05  # 5% expedited fee
        alternative_supplier_cost = total_at_risk_value * 0.03  # 3% alternative supplier premium
        rerouting_cost = total_at_risk_value * 0.02  # 2% rerouting fee
        
        return {
            "status": "success",
            "agent": self.agent_name,
            "total_at_risk_value": total_at_risk_value,
            "mitigation_costs": {
                "expedited_shipping": expedited_cost,
                "alternative_supplier": alternative_supplier_cost,
                "rerouting": rerouting_cost,
                "total_estimated": expedited_cost + alternative_supplier_cost + rerouting_cost
            },
            "cost_savings_potential": total_at_risk_value * 0.10,  # Potential loss if not mitigated
            "timestamp": "2026-06-14T14:00:00Z"
        }
    
    def execute(self, suppliers_source: str, at_risk_shipments: List[Dict], disruptions: List[Dict]) -> Dict:
        """Main execution method"""
        suppliers = self.load_suppliers(suppliers_source)
        recommendations = self.recommend_alternatives(at_risk_shipments, suppliers, disruptions)
        costs = self.calculate_mitigation_costs(at_risk_shipments)
        
        return {
            "agent": self.agent_name,
            "mitigation_recommendations": recommendations,
            "cost_analysis": costs
        }
