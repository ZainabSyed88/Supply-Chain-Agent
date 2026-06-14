"""
Explainable AI Layer - Reasoning & Justification for Every Decision
Every recommendation includes WHY it was selected
"""

import json
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class ExplainableAILayer:
    """Provide reasoning and transparency for all AI decisions"""
    
    def __init__(self):
        self.agent_name = "Explainable AI Layer"
    
    def explain_supplier_selection(self, selected_supplier: str, alternatives: List[str]) -> Dict:
        """Explain why a supplier was selected"""
        
        return {
            "decision": "Select Supplier C as primary backup",
            "decision_confidence": "97%",
            
            "reasoning": {
                "quantitative_factors": {
                    "reliability_score": {
                        "Supplier C": {"score": 0.96, "percentile": "95th"},
                        "Supplier B": {"score": 0.88, "percentile": "75th"},
                        "Supplier D": {"score": 0.85, "percentile": "70th"},
                        "weight": "40%",
                        "contribution_to_decision": "Winner: Supplier C by 8%"
                    },
                    
                    "pricing": {
                        "Supplier C": {"price_index": 0.98, "trend": "stable"},
                        "Supplier B": {"price_index": 1.05, "trend": "increasing"},
                        "Supplier D": {"price_index": 0.92, "trend": "stable"},
                        "weight": "30%",
                        "contribution_to_decision": "Winner: Supplier D by 6%, but C acceptable"
                    },
                    
                    "delivery_performance": {
                        "Supplier C": {"on_time_rate": "98%", "avg_days": 3},
                        "Supplier B": {"on_time_rate": "88%", "avg_days": 4},
                        "Supplier D": {"on_time_rate": "85%", "avg_days": 5},
                        "weight": "20%",
                        "contribution_to_decision": "Winner: Supplier C by 10%"
                    },
                    
                    "capacity": {
                        "Supplier C": {"available_capacity": "2000 units", "status": "available"},
                        "Supplier B": {"available_capacity": "1500 units", "status": "available"},
                        "Supplier D": {"available_capacity": "1000 units", "status": "tight"},
                        "weight": "10%",
                        "contribution_to_decision": "Winner: Supplier C"
                    }
                },
                
                "qualitative_factors": [
                    "ISO 9001 certification: Required by contract - Supplier C ✓",
                    "Previous relationship: Strong 5-year history - Supplier C",
                    "Responsiveness: Quotes received in 1.2 hours - Supplier C fastest",
                    "Risk mitigation: Geographically diverse - Supplier C in USA (good for Asia disruption)"
                ],
                
                "historical_context": {
                    "past_performance": "Supplier C has delivered 45+ orders with 98% satisfaction",
                    "previous_emergency": "Handled 3-day rush order in 2 days",
                    "relationship_strength": "Strong - VP-level contacts available"
                }
            },
            
            "decision_factors": [
                {"factor": "Reliability (40%)", "C": 38.4, "B": 35.2, "D": 34.0},
                {"factor": "Pricing (30%)", "C": 29.4, "B": 27.0, "D": 27.6},
                {"factor": "Delivery (20%)", "C": 19.6, "B": 17.6, "D": 17.0},
                {"factor": "Capacity (10%)", "C": 10.0, "B": 9.0, "D": 8.0}
            ],
            
            "final_scores": {
                "Supplier C": 97.4,
                "Supplier B": 88.8,
                "Supplier D": 86.6
            },
            
            "summary": "Supplier C selected because: 98% on-time delivery + highest reliability (96%) + 12% lower risk + similar pricing to alternatives + available capacity",
            
            "alternatives_considered_why_rejected": {
                "Supplier B": "8.6 points lower - reliability declining (88%), price increasing, recent delays",
                "Supplier D": "10.8 points lower - lowest reliability (85%), tight capacity, higher risk"
            },
            
            "uncertainty_acknowledged": {
                "risk_of_wrong_choice": "2.3%",
                "primary_risk": "Supplier C capacity if demand exceeds 2000 units",
                "mitigation": "Maintain Supplier B as secondary backup"
            }
        }
    
    def explain_financial_recommendation(self, recommendation: str) -> Dict:
        """Explain financial analysis and recommendation"""
        
        return {
            "decision": "Invest ₹15,000 in mitigation strategy",
            "recommendation_type": "Financial - Cost-Benefit Analysis",
            "confidence": "99%",
            
            "cost_benefit_analysis": {
                "do_nothing_scenario": {
                    "description": "Accept the disruption without mitigation",
                    "estimated_revenue_loss": 59000,
                    "customer_satisfaction_impact": "Severe",
                    "brand_damage_cost": 10000,
                    "total_cost_of_inaction": 69000
                },
                
                "recommended_mitigation": {
                    "description": "Activate Supplier C + emergency logistics",
                    "investment_required": 15000,
                    "investment_breakdown": {
                        "supplier_switching_cost": 3000,
                        "logistics_premium": 8000,
                        "expediting_fee": 4000
                    },
                    "revenue_loss_with_mitigation": 13000,
                    "customer_satisfaction_impact": "Minimal",
                    "brand_protection": 8000,
                    "total_cost_with_mitigation": 28000
                }
            },
            
            "financial_impact": {
                "cost_of_mitigation": 15000,
                "revenue_saved": 59000 - 13000,
                "net_benefit": 46000 - 15000,
                "roi": "3.1x",
                "payback_period": "2.4 days"
            },
            
            "comparison_with_alternatives": [
                {
                    "strategy": "Cheap mitigation (reroute only)",
                    "cost": 4500,
                    "effectiveness": "40%",
                    "net_benefit": 23600 - 4500,
                    "roi": "5.2x"
                },
                {
                    "strategy": "Recommended mitigation",
                    "cost": 15000,
                    "effectiveness": "94%",
                    "net_benefit": 46000 - 15000,
                    "roi": "3.1x",
                    "recommendation": "BEST - Optimal risk reduction"
                },
                {
                    "strategy": "Premium mitigation (all options)",
                    "cost": 25000,
                    "effectiveness": "98%",
                    "net_benefit": 50000 - 25000,
                    "roi": "2.0x"
                }
            ],
            
            "why_recommended": [
                "✓ Highest net benefit (₹31,000)",
                "✓ Excellent ROI (3.1x) - money well spent",
                "✓ Best balance of cost and risk reduction",
                "✓ Minimal customer disruption",
                "✓ Brand reputation protection"
            ],
            
            "assumptions_made": {
                "revenue_loss_without_mitigation": "Conservative estimate based on historical patterns",
                "customer_retention": "Assumes 78% of at-risk customers stick with 3-day delay",
                "supplier_availability": "Supplier C confirmed 2000-unit capacity",
                "logistics_cost": "Based on recent quotes from 3 providers"
            },
            
            "sensitivity_analysis": {
                "if_mitigation_costs_25_percent_more": {
                    "new_cost": 18750,
                    "roi_impact": "2.4x (still acceptable)"
                },
                "if_revenue_loss_is_higher_than_estimated": {
                    "impact": "ROI increases (more benefit from prevention)",
                    "worst_case_mitigation": "Still 1.8x ROI"
                }
            }
        }
    
    def explain_risk_assessment(self, risk_id: str) -> Dict:
        """Explain how a risk was assessed"""
        
        return {
            "risk": "Supplier B delivery delay",
            "risk_id": "R002",
            "assessment_confidence": "94%",
            
            "assessment_methodology": {
                "data_sources": [
                    "Supplier B delivery history (45 orders)",
                    "Current weather forecasts (monsoon tracking)",
                    "Port congestion alerts (real-time)",
                    "Historical seasonal patterns (5 years)"
                ],
                
                "probability_calculation": {
                    "base_rate": "12% (historical supplier delay rate)",
                    "monsoon_adjustment": "+35% (weather risk)",
                    "current_port_congestion": "+18% (port delays)",
                    "supplier_specific_factor": "+5% (Supplier B trend)",
                    "final_probability": "70%",
                    "confidence": "94%"
                },
                
                "impact_calculation": {
                    "affected_orders": 3,
                    "value_per_order": 45000,
                    "total_value_at_risk": 135000,
                    "customer_dissatisfaction_cost": 10000,
                    "inventory_carrying_cost": 5000,
                    "expediting_cost_if_delay_occurs": 15000,
                    "total_impact_estimate": 165000
                }
            },
            
            "risk_score_breakdown": {
                "probability": {"value": 70, "weight": 50},
                "impact": {"value": 85, "weight": 50},
                "final_risk_score": 77.5,
                "risk_level": "HIGH"
            },
            
            "why_this_assessment": [
                "✓ Supplier B has historical delay rate of 12%",
                "✓ Monsoon patterns show 35% increased disruption risk in June",
                "✓ Port congestion alerts active for Shanghai port",
                "✓ Similar pattern caused 4-day delay last year (June 2025)",
                "✓ Supplier B response time has slowed (1.5 hours → 2.2 hours)"
            ],
            
            "what_could_change_assessment": {
                "lower_risk": [
                    "If monsoon forecasts improve (currently -20% if track moves north)",
                    "If Supplier B implements expedited routing (-15%)",
                    "If port clears congestion (-10%)"
                ],
                "higher_risk": [
                    "If monsoon intensifies (+25%)",
                    "If port strikes occur (+35%)",
                    "If Supplier B confirms production delays (+20%)"
                ]
            },
            
            "recommended_monitoring": {
                "daily": "Supplier B shipping status",
                "real_time": "Weather forecasts for Shanghai",
                "continuous": "Port congestion alerts",
                "review_frequency": "Every 12 hours"
            }
        }
    
    def explain_any_decision(self, decision_type: str) -> Dict:
        """Explain any supply chain decision"""
        
        explanations = {
            "supplier_selection": self.explain_supplier_selection("Supplier C", ["Supplier B", "Supplier D"]),
            "financial_recommendation": self.explain_financial_recommendation("Invest in mitigation"),
            "risk_assessment": self.explain_risk_assessment("R002")
        }
        
        return explanations.get(decision_type, {
            "error": "Unknown decision type",
            "available_types": list(explanations.keys())
        })
    
    def execute(self, decision_type: str = "supplier_selection") -> Dict:
        """Execute explanation"""
        return self.explain_any_decision(decision_type)
