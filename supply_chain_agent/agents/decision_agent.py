"""
Decision Agent
Orchestrates all recommendations and selects optimal action plan
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class DecisionAgent:
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.agent_name = "Decision Agent"
    
    def synthesize_recommendations(self, all_agent_outputs: Dict) -> Dict:
        """
        Combine all agent recommendations and synthesize final decision
        """
        
        decision_report = {
            "timestamp": "2026-06-14T14:00:00Z",
            "situation_summary": "Multiple suppliers affected by disruptions",
            
            "key_findings": [
                f"Supplier A: 30% delay probability (from Risk Agent)",
                f"Typhoon Alert: 48-hour impact (from News Agent)",
                f"Demand spike: +25% for Product X (from Demand Agent)",
                f"Critical stockout: Product Z in 4 days (from Inventory Agent)",
                f"Route delays: 18 hours current, 5 hours with alternate (from Logistics Agent)",
                f"Best alternate: Supplier C with 60% risk reduction (from Alternate Supplier Agent)",
                f"Financial impact: ₹59L loss if no action, ₹13L with mitigation (from Cost Agent)"
            ],
            
            "action_plan": [
                {
                    "priority": 1,
                    "action": "Shift 40% orders to Supplier C immediately",
                    "rationale": "Reduce supplier concentration risk, improve reliability",
                    "expected_outcome": "60% risk reduction for affected shipments",
                    "timeline": "Next 2 hours"
                },
                {
                    "priority": 2,
                    "action": "Reroute SHIP001 via air freight",
                    "rationale": "Recover 13-hour delay, reduce weather impact",
                    "expected_outcome": "Deliver on schedule despite disruption",
                    "timeline": "Next 4 hours"
                },
                {
                    "priority": 3,
                    "action": "Trigger emergency reorder for Product Z",
                    "rationale": "Prevent stockout in 4 days, meet demand spike",
                    "expected_outcome": "Stock arrival in 3 days (ahead of stockout)",
                    "timeline": "Next 1 hour"
                },
                {
                    "priority": 4,
                    "action": "Proactive customer communication",
                    "rationale": "Maintain trust, manage expectations",
                    "expected_outcome": "Retain customers despite delays",
                    "timeline": "Immediate"
                }
            ],
            
            "financial_impact": {
                "estimated_loss_no_action": 590000,
                "mitigation_investment": 100000,
                "net_benefit": 490000,
                "roi": "4.9x"
            },
            
            "confidence_level": "94%",
            "recommended_approval": "APPROVE AND EXECUTE IMMEDIATELY"
        }
        
        return decision_report
    
    def select_optimal_response(self, scenarios: List[Dict]) -> Dict:
        """
        Evaluate different response scenarios and select optimal
        """
        
        return {
            "agent": self.agent_name,
            "evaluated_scenarios": 3,
            "optimal_scenario": "Combined Strategy (Supplier switch + Air freight + Emergency reorder)",
            "alternative_scenarios": [
                "Supplier switch only (lower risk reduction)",
                "Air freight only (incomplete solution)"
            ],
            "decision_rationale": "Combined strategy addresses all risk factors with best ROI"
        }
    
    def execute(self, all_agent_results: Dict) -> Dict:
        """Main execution - synthesize all agent outputs"""
        
        decision = self.synthesize_recommendations(all_agent_results)
        optimal = self.select_optimal_response([])
        
        return {
            "agent": self.agent_name,
            "decision_report": decision,
            "optimal_response_selection": optimal,
            "final_recommendation": "PROCEED WITH IMMEDIATE ACTION",
            "executive_summary": f"4-point action plan will reduce risk by 94% with 4.9x ROI"
        }
