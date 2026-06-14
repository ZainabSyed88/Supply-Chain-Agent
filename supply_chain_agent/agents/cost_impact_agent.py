"""
Cost Impact Agent
Estimates financial impact of disruptions
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class CostImpactAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Cost Impact Agent"
    
    def estimate_disruption_cost(self, at_risk_shipments: List[Dict]) -> Dict:
        """Estimate financial impact of disruptions"""
        
        total_value = sum(s.get('value', 0) for s in at_risk_shipments)
        
        # Cost calculations
        loss_if_no_action = total_value * 0.20  # 20% loss
        expedited_cost = total_value * 0.05     # 5% expediting fee
        alternate_supplier_cost = total_value * 0.03  # 3% premium
        rerouting_cost = total_value * 0.02    # 2% rerouting
        
        total_mitigation = expedited_cost + alternate_supplier_cost + rerouting_cost
        
        return {
            "agent": self.agent_name,
            "at_risk_value": total_value,
            "estimated_loss_no_action": loss_if_no_action,
            "mitigation_strategy_costs": {
                "expedited_shipping": expedited_cost,
                "alternate_supplier": alternate_supplier_cost,
                "rerouting": rerouting_cost,
                "total": total_mitigation
            },
            "net_benefit": loss_if_no_action - total_mitigation
        }
    
    def compare_mitigation_strategies(self) -> Dict:
        """Compare different mitigation approaches"""
        
        strategies = {
            "Strategy A: Do Nothing": {
                "cost": 0,
                "estimated_loss": 59000,
                "net_impact": -59000,
                "risk_level": "HIGH"
            },
            "Strategy B: Expedited Shipping Only": {
                "cost": 5000,
                "estimated_loss": 10000,
                "net_impact": -15000,
                "risk_level": "MEDIUM"
            },
            "Strategy C: Alternate Supplier": {
                "cost": 3000,
                "estimated_loss": 8000,
                "net_impact": -11000,
                "risk_level": "MEDIUM-LOW"
            },
            "Strategy D: Combined (Recommended)": {
                "cost": 10000,
                "estimated_loss": 3000,
                "net_impact": -13000,
                "roi": "4.5x",
                "risk_level": "LOW"
            }
        }
        
        return {
            "agent": self.agent_name,
            "strategy_comparison": strategies,
            "recommended_strategy": "Strategy D: Combined",
            "expected_roi": "4.5x"
        }
    
    def calculate_roi(self, mitigation_cost: float, potential_loss: float) -> Dict:
        """Calculate ROI of mitigation investment"""
        
        net_benefit = potential_loss - mitigation_cost
        roi = (net_benefit / mitigation_cost * 100) if mitigation_cost > 0 else 0
        
        return {
            "agent": self.agent_name,
            "mitigation_cost": mitigation_cost,
            "potential_loss_avoided": net_benefit,
            "roi_percentage": roi,
            "recommendation": "PROCEED" if roi > 50 else "REVIEW"
        }
    
    def execute(self, at_risk_shipments: List[Dict]) -> Dict:
        """Main execution"""
        cost_analysis = self.estimate_disruption_cost(at_risk_shipments)
        strategy_comparison = self.compare_mitigation_strategies()
        roi = self.calculate_roi(
            cost_analysis['mitigation_strategy_costs']['total'],
            cost_analysis['estimated_loss_no_action']
        )
        
        return {
            "agent": self.agent_name,
            "cost_analysis": cost_analysis,
            "strategy_comparison": strategy_comparison,
            "roi_analysis": roi,
            "summary": f"Total value at risk: ₹{cost_analysis['at_risk_value']:,.0f} - Best strategy ROI: {roi['roi_percentage']:.0f}%"
        }
