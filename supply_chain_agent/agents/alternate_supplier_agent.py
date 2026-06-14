"""
Alternate Supplier Agent
Identifies and ranks alternative suppliers
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class AlternateSupplierAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Alternate Supplier Agent"
    
    def find_alternatives(self, affected_supplier_id: str, suppliers: List[Dict]) -> Dict:
        """Find and rank alternative suppliers"""
        
        # Get all suppliers except the affected one
        alternatives = [s for s in suppliers if s.get('id') != affected_supplier_id]
        
        # Rank by reliability score
        ranked = sorted(
            alternatives,
            key=lambda x: x.get('on_time_rate', 0) * (1 - x.get('risk_score', 0)),
            reverse=True
        )
        
        detailed_alternatives = []
        for supplier in ranked[:3]:  # Top 3
            detailed_alternatives.append({
                "supplier_id": supplier.get('id'),
                "name": supplier.get('name'),
                "location": supplier.get('location'),
                "on_time_rate": supplier.get('on_time_rate'),
                "risk_score": supplier.get('risk_score'),
                "reliability_score": supplier.get('on_time_rate', 0) * (1 - supplier.get('risk_score', 0)),
                "capacity": "High" if supplier.get('on_time_rate', 0) > 0.90 else "Medium",
                "lead_time_days": 3
            })
        
        return {
            "agent": self.agent_name,
            "original_supplier": affected_supplier_id,
            "alternatives": detailed_alternatives,
            "best_alternative": detailed_alternatives[0] if detailed_alternatives else None
        }
    
    def compare_suppliers(self, alternatives: List[Dict]) -> Dict:
        """Compare cost and delivery metrics"""
        
        comparison = {
            "total_cost_current_supplier": 100000,  # Baseline
            "cost_with_alternative_1": 103000,  # 3% premium
            "cost_with_alternative_2": 102000,  # 2% premium
            "cost_with_alternative_3": 104500   # 4.5% premium
        }
        
        delivery_comparison = {
            "current_supplier_delay_probability": "30%",
            "alternative_1_delay_probability": "8%",
            "alternative_2_delay_probability": "5%",
            "alternative_3_delay_probability": "12%"
        }
        
        return {
            "agent": self.agent_name,
            "cost_comparison": comparison,
            "delivery_comparison": delivery_comparison,
            "recommended_switch": "Alternative 2 (best balance of cost and reliability)"
        }
    
    def execute(self, affected_supplier: str, suppliers: List[Dict]) -> Dict:
        """Main execution"""
        alternatives = self.find_alternatives(affected_supplier, suppliers)
        comparison = self.compare_suppliers(alternatives.get('alternatives', []))
        
        return {
            "agent": self.agent_name,
            "alternatives": alternatives,
            "comparison": comparison,
            "summary": f"Found {len(alternatives['alternatives'])} viable alternatives - Best option: {alternatives['best_alternative'].get('name') if alternatives['best_alternative'] else 'None'}"
        }
